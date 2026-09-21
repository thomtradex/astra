import { AuditAction } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { DailyBriefingService } from './daily-briefing.service';
import { CooDecisionEngine } from './engines/intelligence.engine';
import { IntelligenceChange, IntelligenceDecisionHistory } from './intelligence.types';

const CHANGE_WINDOW_HOURS = 24;
const CHANGE_LIMIT = 20;

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: CooDecisionEngine,
    private readonly dailyBriefingService: DailyBriefingService,
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
              in: [
                AuditAction.CREATE,
                AuditAction.UPDATE,
                AuditAction.DELETE,
                AuditAction.ACCESS_DENIED,
              ],
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
            actor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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

    const decisionHistory = this.buildDecisionHistory(
      recentAuditLogs,
      projects,
      workOrders,
      maintenancePlans,
      new Date(briefing.generatedAt),
    );

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

    const recentChanges = recentAuditLogs.filter(
      (log) => !this.isCooAction(log.metadata) && log.resourceId,
    );
    const seenChanges = new Set<string>();
    const deduplicatedChanges = recentChanges.filter((log) => {
      const key = `${log.resource}:${log.resourceId}:${log.action}`;
      if (seenChanges.has(key)) {
        return false;
      }

      seenChanges.add(key);
      return true;
    });

    const changes = this.buildChanges(
      deduplicatedChanges.slice(0, CHANGE_LIMIT),
      projects,
      workOrders,
      maintenancePlans,
    );

    return {
      ...briefing,
      signals,
      decisionMetrics,
      decisionHistory,
      changes,
      daily: this.dailyBriefingService.build(signals, new Date(briefing.generatedAt)),
    };
  }

  private buildDecisionHistory(
    auditLogs: Array<{
      id: string;
      action: AuditAction;
      resource: string;
      resourceId: string | null;
      createdAt: Date;
      metadata: unknown;
      actor: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      } | null;
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
      assigned_to_id: string | null;
      status: string;
    }>,
    maintenancePlans: Array<{
      id: string;
      nextDue: Date;
    }>,
    checkedAt: Date,
  ): IntelligenceDecisionHistory[] {
    return auditLogs
      .filter((log) => this.isCooAction(log.metadata))
      .map((log): IntelligenceDecisionHistory | null => {
        if (!log.resourceId) return null;

        const metadata = log.metadata as {
          outcomeStatus?: unknown;
          actionType?: unknown;
          message?: unknown;
          assignedToId?: unknown;
          status?: unknown;
          nextDue?: unknown;
        };

        if (
          metadata.outcomeStatus !== 'EXECUTED' &&
          metadata.outcomeStatus !== 'DENIED' &&
          metadata.outcomeStatus !== 'FAILED'
        ) {
          return null;
        }

        const actorName = log.actor
          ? [log.actor.firstName, log.actor.lastName].filter(Boolean).join(' ') || undefined
          : undefined;

        const verification = this.verifyDecision(
          log.resource,
          log.resourceId,
          typeof metadata.actionType === 'string' ? metadata.actionType : undefined,
          metadata.outcomeStatus,
          typeof metadata.assignedToId === 'string' ? metadata.assignedToId : undefined,
          typeof metadata.status === 'string' ? metadata.status : undefined,
          typeof metadata.nextDue === 'string' ? metadata.nextDue : undefined,
          projects,
          workOrders,
          maintenancePlans,
          checkedAt,
        );

        return {
          id: log.id,
          timestamp: log.createdAt.toISOString(),
          status: metadata.outcomeStatus,
          actionType: typeof metadata.actionType === 'string' ? metadata.actionType : 'COO_ACTION',
          resource: log.resource,
          resourceId: log.resourceId,
          actor: log.actor
            ? {
                id: log.actor.id,
                name: actorName,
                email: log.actor.email,
              }
            : undefined,
          message: typeof metadata.message === 'string' ? metadata.message : '',
          verification,
        };
      })
      .filter((item): item is IntelligenceDecisionHistory => item !== null);
  }

  private verifyDecision(
    resource: string,
    resourceId: string,
    actionType: string | undefined,
    outcomeStatus: 'EXECUTED' | 'DENIED' | 'FAILED',
    assignedToId: string | undefined,
    targetStatus: string | undefined,
    targetNextDue: string | undefined,
    projects: Array<{
      id: string;
      status: string;
    }>,
    workOrders: Array<{
      id: string;
      assigned_to_id: string | null;
      status: string;
    }>,
    maintenancePlans: Array<{
      id: string;
      nextDue: Date;
    }>,
    checkedAt: Date,
  ):
    | {
        status: 'VERIFIED' | 'STILL_OPEN' | 'NOT_VERIFIED';
        label: string;
        explanation: string;
        checkedAt: string;
      }
    | undefined {
    if (outcomeStatus !== 'EXECUTED') {
      return undefined;
    }

    if (actionType === 'SET_PROJECT_STATUS' && resource === 'projects') {
      const project = projects.find((item) => item.id === resourceId);

      if (!project) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'O projeto já não está disponível no estado atual.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      if (!targetStatus) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'A decisão não contém o estado que deveria ter sido definido.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      if (project.status === targetStatus) {
        return {
          status: 'VERIFIED',
          label: 'Resultado confirmado',
          explanation:
            'O estado definido pela decisão está atualmente aplicado ao projeto.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      return {
        status: 'STILL_OPEN',
        label: 'Situação continua aberta',
        explanation:
          'O projeto não está atualmente no estado definido pela decisão.',
        checkedAt: checkedAt.toISOString(),
      };
    }

    if (actionType === 'UPDATE_MAINTENANCE' && resource === 'maintenance_plans') {
      const maintenancePlan = maintenancePlans.find((plan) => plan.id === resourceId);

      if (!maintenancePlan) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'O plano de manutenção já não está disponível no estado atual.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      if (!targetNextDue) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'A decisão não contém a data que deveria ter sido definida.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      const targetDate = new Date(targetNextDue);

      if (
        Number.isNaN(targetDate.getTime()) ||
        maintenancePlan.nextDue.toISOString() !== targetDate.toISOString()
      ) {
        return {
          status: 'STILL_OPEN',
          label: 'Situação continua aberta',
          explanation:
            'O plano de manutenção não está atualmente agendado para a data definida pela decisão.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      return {
        status: 'VERIFIED',
        label: 'Resultado confirmado',
        explanation:
          'A data definida pela decisão está atualmente aplicada ao plano de manutenção.',
        checkedAt: checkedAt.toISOString(),
      };
    }

    if (actionType === 'ASSIGN_WORK_ORDER' && resource === 'work_orders') {
      const workOrder = workOrders.find((order) => order.id === resourceId);

      if (!workOrder) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'A ordem de trabalho já não está disponível no estado atual.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      if (!assignedToId) {
        return {
          status: 'NOT_VERIFIED',
          label: 'Não foi possível verificar',
          explanation: 'A decisão não contém o responsável que deveria ter sido atribuído.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      if (workOrder.assigned_to_id === assignedToId) {
        return {
          status: 'VERIFIED',
          label: 'Resultado confirmado',
          explanation:
            'O responsável definido pela decisão está atualmente atribuído à ordem de trabalho.',
          checkedAt: checkedAt.toISOString(),
        };
      }

      return {
        status: 'STILL_OPEN',
        label: 'Situação continua aberta',
        explanation:
          'A ordem de trabalho não está atualmente atribuída ao responsável definido pela decisão.',
        checkedAt: checkedAt.toISOString(),
      };
    }

    return undefined;
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
