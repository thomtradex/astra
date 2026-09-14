import { AuditAction } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CooDecisionEngine } from './engines/intelligence.engine';
import { IntelligenceChange } from './intelligence.types';

const CHANGE_WINDOW_HOURS = 24;
const CHANGE_LIMIT = 20;

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: CooDecisionEngine,
  ) {}

  async analyze(organizationId: string) {
    const [workOrders, maintenancePlans, assets, sites, projects, recentAuditLogs] =
      await Promise.all([
        this.prisma.work_orders.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assigned_to_id: true,
            project_id: true,
            asset_id: true,
            updated_at: true,
          },
        }),
        this.prisma.maintenance_plans.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            plan: true,
            status: true,
            nextDue: true,
            assetId: true,
          },
        }),
        this.prisma.assets.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            code: true,
            serial_number: true,
            status: true,
            site_id: true,
          },
        }),
        this.prisma.sites.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            code: true,
          },
        }),
        this.prisma.projects.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            end_date: true,
          },
        }),
        this.prisma.auditLog.findMany({
          where: {
            organizationId,
            createdAt: {
              gte: new Date(Date.now() - CHANGE_WINDOW_HOURS * 60 * 60 * 1000),
            },
            resource: {
              in: ['projects', 'work-orders', 'work_orders', 'maintenance', 'maintenance_plans'],
            },
            action: {
              in: [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DELETE],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            action: true,
            resource: true,
            resourceId: true,
            createdAt: true,
            metadata: true,
          },
        }),
      ]);

    const briefing = this.engine.analyze({
      workOrders,
      maintenancePlans,
      assets,
      sites,
      projects,
    });

    const lastCooActions = new Map<
      string,
      {
        status: 'EXECUTED' | 'DENIED' | 'FAILED';
        timestamp: string;
        actionType: string;
        message: string;
      }
    >();
    for (const log of recentAuditLogs) {
      if (!this.isCooAction(log.metadata)) continue;
      const metadata = log.metadata as {
        outcomeStatus?: unknown;
        actionType?: unknown;
        message?: unknown;
      };
      if (typeof log.resourceId !== 'string') continue;
      if (
        metadata.outcomeStatus !== 'EXECUTED' &&
        metadata.outcomeStatus !== 'DENIED' &&
        metadata.outcomeStatus !== 'FAILED'
      )
        continue;
      lastCooActions.set(log.resourceId, {
        status: metadata.outcomeStatus,
        timestamp: log.createdAt.toISOString(),
        actionType: typeof metadata.actionType === 'string' ? metadata.actionType : 'COO_ACTION',
        message: typeof metadata.message === 'string' ? metadata.message : '',
      });
    }

    const decisionMetrics = recentAuditLogs.reduce(
      (metrics, log) => {
        if (!this.isCooAction(log.metadata)) return metrics;
        const outcome = (log.metadata as { outcomeStatus?: unknown }).outcomeStatus;
        if (outcome === 'EXECUTED') metrics.executed += 1;
        if (outcome === 'DENIED') metrics.denied += 1;
        if (outcome === 'FAILED') metrics.failed += 1;
        return metrics;
      },
      { executed: 0, denied: 0, failed: 0 },
    );

    const signals = briefing.signals.map((signal) => ({
      ...signal,
      lastAction: signal.action ? lastCooActions.get(signal.action.resourceId) : undefined,
    }));

    return {
      ...briefing,
      signals,
      decisionMetrics,
      changes: this.buildChanges(
        recentAuditLogs.filter((log) => !this.isCooAction(log.metadata)).slice(0, CHANGE_LIMIT),
        projects,
        workOrders,
        maintenancePlans,
      ),
    };
  }

  private buildChanges(
    auditLogs: Array<{
      id: string;
      action: AuditAction;
      resource: string;
      resourceId: string | null;
      createdAt: Date;
      metadata: unknown;
    }>,
    projects: Array<{
      id: string;
      name: string;
      status: string;
      progress: number;
      end_date: Date | null;
    }>,
    workOrders: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      assigned_to_id: string | null;
      project_id: string | null;
      asset_id: string | null;
    }>,
    maintenancePlans: Array<{
      id: string;
      plan: string;
      status: string;
      nextDue: Date;
      assetId: string;
    }>,
  ): IntelligenceChange[] {
    return auditLogs
      .filter((log) => log.resourceId)
      .map((log) => this.toChange(log, projects, workOrders, maintenancePlans))
      .filter((change): change is IntelligenceChange => change !== null);
  }

  private toChange(
    log: {
      id: string;
      action: AuditAction;
      resource: string;
      resourceId: string | null;
      createdAt: Date;
      metadata: unknown;
    },
    projects: Array<{
      id: string;
      name: string;
      status: string;
      progress: number;
      end_date: Date | null;
    }>,
    workOrders: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      assigned_to_id: string | null;
      project_id: string | null;
      asset_id: string | null;
    }>,
    maintenancePlans: Array<{
      id: string;
      plan: string;
      status: string;
      nextDue: Date;
      assetId: string;
    }>,
  ): IntelligenceChange | null {
    const resourceId = log.resourceId!;

    if (log.resource === 'projects') {
      const project = projects.find((item) => item.id === resourceId);
      const label = project?.name ?? `Projeto ${resourceId}`;

      return {
        id: log.id,
        type: 'PROJECT_CHANGED',
        severity: log.action === AuditAction.DELETE ? 'CRITICAL' : 'HIGH',
        title: `${label} foi ${this.actionLabel(log.action)}`,
        explanation: project
          ? `O projeto foi alterado recentemente e encontra-se atualmente em estado ${project.status}.`
          : 'Foi registada uma alteração recente neste projeto.',
        evidence: [
          `Alteração registada há ${this.relativeTime(log.createdAt)}.`,
          ...(project
            ? [`Estado atual: ${project.status}.`, `Progresso atual: ${project.progress}%.`]
            : []),
        ],
        impact:
          log.action === AuditAction.DELETE
            ? 'A remoção pode afetar o controlo operacional e a continuidade do acompanhamento.'
            : 'Uma alteração recente no projeto pode exigir validação da operação.',
        recommendedAction:
          log.action === AuditAction.DELETE
            ? 'Confirmar a remoção e verificar se existem dependências operacionais.'
            : 'Rever a alteração e confirmar que o estado atual continua alinhado com o plano.',
        timestamp: log.createdAt.toISOString(),
        source: {
          resource: 'projects',
          resourceId,
        },
      };
    }

    if (log.resource === 'work-orders') {
      const workOrder = workOrders.find((item) => item.id === resourceId);
      const label = workOrder?.title ?? `Ordem ${resourceId}`;

      return {
        id: log.id,
        type: 'WORK_ORDER_CHANGED',
        severity:
          log.action === AuditAction.DELETE
            ? 'HIGH'
            : workOrder?.priority === 'CRITICAL'
              ? 'CRITICAL'
              : workOrder?.priority === 'HIGH'
                ? 'HIGH'
                : 'MEDIUM',
        title: `${label} foi ${this.actionLabel(log.action)}`,
        explanation: workOrder
          ? `A ordem de trabalho foi alterada recentemente e encontra-se ${workOrder.status.toLowerCase()}.`
          : 'Foi registada uma alteração recente nesta ordem de trabalho.',
        evidence: [
          `Alteração registada há ${this.relativeTime(log.createdAt)}.`,
          ...(workOrder ? [`Prioridade atual: ${workOrder.priority}.`] : []),
        ],
        impact:
          workOrder?.priority === 'CRITICAL'
            ? 'A alteração pode afetar uma atividade operacional crítica e exigir intervenção imediata.'
            : workOrder?.priority === 'HIGH'
              ? 'A alteração pode afetar uma atividade operacional de alta prioridade.'
              : 'A alteração pode exigir validação do próximo passo operacional.',
        recommendedAction:
          'Rever a ordem de trabalho e confirmar responsável, estado e próxima ação.',
        timestamp: log.createdAt.toISOString(),
        source: {
          resource: 'work-orders',
          resourceId,
        },
      };
    }

    if (log.resource === 'maintenance' || log.resource === 'maintenance_plans') {
      const maintenance = maintenancePlans.find((item) => item.id === resourceId);
      const label = maintenance?.plan ?? `Plano de manutenção ${resourceId}`;

      return {
        id: log.id,
        type: 'MAINTENANCE_CHANGED',
        severity: log.action === AuditAction.DELETE ? 'HIGH' : 'MEDIUM',
        title: `${label} foi ${this.actionLabel(log.action)}`,
        explanation: maintenance
          ? `O plano de manutenção foi alterado recentemente e encontra-se ${maintenance.status.toLowerCase()}.`
          : 'Foi registada uma alteração recente neste plano de manutenção.',
        evidence: [
          `Alteração registada há ${this.relativeTime(log.createdAt)}.`,
          ...(maintenance
            ? [`Próxima intervenção: ${maintenance.nextDue.toLocaleDateString('pt-PT')}.`]
            : []),
        ],
        impact: 'Alterações na manutenção podem alterar a exposição operacional do equipamento.',
        recommendedAction: 'Rever a alteração e confirmar a próxima intervenção de manutenção.',
        timestamp: log.createdAt.toISOString(),
        source: {
          resource: 'maintenance_plans',
          resourceId,
        },
      };
    }

    return null;
  }

  private isCooAction(metadata: unknown): boolean {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return false;
    }

    const value = metadata as { type?: unknown; source?: unknown };

    return value.type === 'coo_action' && value.source === 'coo';
  }

  private actionLabel(action: AuditAction): string {
    switch (action) {
      case AuditAction.CREATE:
        return 'criado';
      case AuditAction.DELETE:
        return 'removido';
      case AuditAction.UPDATE:
      default:
        return 'alterado';
    }
  }

  private relativeTime(date: Date): string {
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

    if (minutes < 1) {
      return 'menos de 1 min';
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} h`;
    }

    return `${Math.floor(hours / 24)} dia(s)`;
  }
}
