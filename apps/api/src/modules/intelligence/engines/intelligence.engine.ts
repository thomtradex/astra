import { Injectable } from '@nestjs/common';

import {
  IntelligenceSeverity,
  IntelligenceSignal,
} from '../intelligence.types';

type WorkOrder = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to_id: string | null;
  project_id: string | null;
  asset_id: string | null;
};

type MaintenancePlan = {
  id: string;
  plan: string;
  status: string;
  nextDue: Date;
  assetId: string;
};

type Asset = {
  id: string;
  name: string;
  code: string;
  serial_number: string | null;
  status: string;
  site_id: string | null;
};

type Site = {
  id: string;
  name: string;
  code: string;
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  end_date: Date | null;
};

type CooDecisionInput = {
  workOrders: WorkOrder[];
  maintenancePlans: MaintenancePlan[];
  assets: Asset[];
  sites: Site[];
  projects: Project[];
  now?: Date;
};

@Injectable()
export class CooDecisionEngine {
  analyze(input: CooDecisionInput) {
    const now = input.now ?? new Date();

    const signals: IntelligenceSignal[] = [];

    const highPriorityOpen = input.workOrders.filter(
      (order) =>
        order.status === 'OPEN' &&
        order.priority === 'HIGH',
    );

    if (highPriorityOpen.length > 0) {
      signals.push(
        this.createHighPriorityWorkOrderSignal(
          highPriorityOpen,
          now,
        ),
      );
    }

    const overdueMaintenance = input.maintenancePlans.filter(
      (plan) =>
        plan.status === 'ACTIVE' &&
        plan.nextDue < now,
    );

    for (const plan of overdueMaintenance.slice(0, 10)) {
      signals.push(
        this.createOverdueMaintenanceSignal(
          plan,
          input.assets,
          input.sites,
          input.workOrders,
          now,
        ),
      );
    }

    const overdueProjects = input.projects.filter(
      (project) =>
        project.progress < 100 &&
        project.end_date !== null &&
        project.end_date < now,
    );

    for (const project of overdueProjects.slice(0, 10)) {
      if (!project.end_date) {
        continue;
      }

      signals.push({
        id: `overdue-project-${project.id}`,
        type: 'OVERDUE_PROJECT',
        severity: project.progress < 50 ? 'CRITICAL' : 'HIGH',
        title: `Projeto fora do prazo — ${project.name}`,
        explanation:
          'O projeto ainda não atingiu 100% de progresso e a data final registada já foi ultrapassada.',
        evidence: this.buildProjectEvidence(
          project,
          input.workOrders,
          now,
        ),
        urgency: 'Requer atenção imediata',
        recommendedAction: this.buildProjectRecommendation(
          project,
          input.workOrders,
        ),
        decision: {
          type: 'REVIEW',
          label: 'Rever projeto em atraso',
        },
        action: {
          type: 'UPDATE_PROJECT',
          resource: 'projects',
          resourceId: project.id,
          requiresAuthorization: true,
        },
        status: 'OPEN',
        timestamp: now.toISOString(),
        source: {
          resource: 'projects',
          resourceId: project.id,
        },
      });
    }

    const unassignedHighPriority = highPriorityOpen.filter(
      (order) => !order.assigned_to_id,
    );

    for (const order of unassignedHighPriority) {
      signals.push({
        id: `unassigned-high-priority-${order.id}`,
        type: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
        severity: 'HIGH',
        title: `Ordem de alta prioridade sem responsável — ${order.title}`,
        explanation:
          'Esta ordem de trabalho de alta prioridade ainda não tem um responsável atribuído.',
        evidence: [
          `Ordem de trabalho: ${order.title}`,
          `Prioridade: ${order.priority}`,
          `Estado: ${order.status}`,
        ],
        urgency: 'Requer atenção hoje',
        recommendedAction:
          'Atribuir um responsável antes de continuar o planeamento operacional.',
        decision: {
          type: 'REVIEW',
          label: 'Atribuir responsável',
        },
        action: {
          type: 'ASSIGN_WORK_ORDER',
          resource: 'work_orders',
          resourceId: order.id,
          requiresAuthorization: true,
        },
        status: 'OPEN',
        timestamp: now.toISOString(),
        source: {
          resource: 'work_orders',
          resourceId: order.id,
        },
      });
    }

    return {
      generatedAt: now.toISOString(),
      signalCount: signals.length,
      signals: signals
        .sort(
          (a, b) =>
            this.severityWeight(b.severity) -
            this.severityWeight(a.severity),
        )
        .slice(0, 20),
    };
  }

  private buildProjectEvidence(
    project: Project,
    workOrders: WorkOrder[],
    now: Date,
  ): string[] {
    if (!project.end_date) {
      return [`Progresso registado: ${project.progress}%`];
    }

    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id,
    );

    const openWorkOrders = projectWorkOrders.filter(
      (order) => order.status === 'OPEN',
    );

    const highPriorityOpen = openWorkOrders.filter(
      (order) => order.priority === 'HIGH',
    );

    const unassignedHighPriority = highPriorityOpen.filter(
      (order) => !order.assigned_to_id,
    );

    const overdueDays = Math.max(
      1,
      Math.floor(
        (now.getTime() - project.end_date.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const evidence = [
      `Progresso registado: ${project.progress}%`,
      `Data final: ${project.end_date.toISOString()}`,
      `Atraso registado: ${overdueDays} dia(s)`,
    ];

    if (openWorkOrders.length > 0) {
      evidence.push(
        `Ordens de trabalho abertas associadas: ${openWorkOrders.length}`,
      );
    }

    if (highPriorityOpen.length > 0) {
      evidence.push(
        `Ordens abertas de alta prioridade: ${highPriorityOpen.length}`,
      );
    }

    if (unassignedHighPriority.length > 0) {
      evidence.push(
        `Ordens de alta prioridade sem responsável: ${unassignedHighPriority.length}`,
      );
    }

    return evidence;
  }

  private buildProjectRecommendation(
    project: Project,
    workOrders: WorkOrder[],
  ): string {
    const projectWorkOrders = workOrders.filter(
      (order) =>
        order.project_id === project.id &&
        order.status === 'OPEN',
    );

    const highPriorityOpen = projectWorkOrders.filter(
      (order) => order.priority === 'HIGH',
    );

    const unassignedHighPriority = highPriorityOpen.filter(
      (order) => !order.assigned_to_id,
    );

    if (unassignedHighPriority.length > 0) {
      return `Rever as ${unassignedHighPriority.length} ordem(ns) de alta prioridade sem responsável associadas ao projeto e definir o responsável e a próxima ação.`;
    }

    if (highPriorityOpen.length > 0) {
      return `Rever primeiro as ${highPriorityOpen.length} ordem(ns) de alta prioridade abertas associadas ao projeto e confirmar a próxima ação.`;
    }

    if (projectWorkOrders.length > 0) {
      return `Rever as ${projectWorkOrders.length} ordem(ns) de trabalho abertas associadas ao projeto e confirmar a próxima ação.`;
    }

    return 'Rever o estado do projeto, identificar o que requer atenção e definir a próxima ação.';
  }

  private createHighPriorityWorkOrderSignal(
    orders: WorkOrder[],
    now: Date,
  ): IntelligenceSignal {
    return {
      id: `high-priority-work-orders-${orders.length}`,
      type: 'HIGH_PRIORITY_WORK_ORDER',
      severity: orders.length >= 5 ? 'CRITICAL' : 'HIGH',
      title: `${orders.length} ordem(ns) de alta prioridade continuam abertas`,
      explanation:
        'Existem trabalhos classificados como alta prioridade que ainda não foram concluídos.',
      evidence: orders.slice(0, 5).map((order) => order.title),
      urgency: 'Requer acompanhamento hoje',
      recommendedAction:
        'Rever as ordens de alta prioridade e confirmar responsável, estado e próxima ação.',
      decision: {
        type: 'REVIEW',
        label: 'Rever ordens prioritárias',
      },
      action: {
        type: 'UPDATE_WORK_ORDER',
        resource: 'work_orders',
        requiresAuthorization: true,
      },
      status: 'OPEN',
      timestamp: now.toISOString(),
      source: {
        resource: 'work_orders',
      },
    };
  }

  private createOverdueMaintenanceSignal(
    plan: MaintenancePlan,
    assets: Asset[],
    sites: Site[],
    workOrders: WorkOrder[],
    now: Date,
  ): IntelligenceSignal {
    const overdueDays = Math.max(
      1,
      Math.floor(
        (now.getTime() - plan.nextDue.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const severity: IntelligenceSeverity =
      overdueDays >= 30 ? 'HIGH' : 'MEDIUM';

    const asset = assets.find(
      (item) => item.id === plan.assetId,
    );

    const site = asset?.site_id
      ? sites.find((item) => item.id === asset.site_id)
      : undefined;

    const assetWorkOrders = workOrders.filter(
      (order) =>
        order.asset_id === plan.assetId &&
        order.status === 'OPEN',
    );

    const highPriorityAssetWorkOrders =
      assetWorkOrders.filter(
        (order) => order.priority === 'HIGH',
      );

    const title = asset
      ? `Manutenção em atraso — ${asset.name}`
      : `Manutenção em atraso — ${plan.plan}`;

    const evidence = [
      `Data prevista: ${plan.nextDue.toISOString()}`,
      `Atraso: ${overdueDays} dia(s)`,
    ];

    if (asset) {
      evidence.unshift(
        `Equipamento: ${asset.name} (${asset.code})`,
      );

      if (site) {
        evidence.push(
          `Site associado: ${site.name} (${site.code})`,
        );
      }
    }

    if (assetWorkOrders.length > 0) {
      evidence.push(
        `Ordens de trabalho abertas associadas: ${assetWorkOrders.length}`,
      );
    }

    if (highPriorityAssetWorkOrders.length > 0) {
      evidence.push(
        `Ordens abertas de alta prioridade: ${highPriorityAssetWorkOrders.length}`,
      );
    }

    let recommendedAction =
      'Agendar ou atualizar a intervenção de manutenção e confirmar o próximo passo.';

    if (highPriorityAssetWorkOrders.length > 0) {
      recommendedAction =
        `Rever primeiro as ${highPriorityAssetWorkOrders.length} ordem(ns) de alta prioridade abertas associadas ao equipamento e confirmar a intervenção de manutenção.`;
    } else if (assetWorkOrders.length > 0) {
      recommendedAction =
        `Rever as ${assetWorkOrders.length} ordem(ns) de trabalho abertas associadas ao equipamento e confirmar a intervenção de manutenção.`;
    }

    return {
      id: `overdue-maintenance-${plan.id}`,
      type: 'OVERDUE_MAINTENANCE',
      severity,
      title,
      explanation:
        'Um plano de manutenção ativo ultrapassou a data prevista de intervenção.',
      evidence,
      urgency:
        overdueDays >= 30
          ? 'Atenção prioritária'
          : 'Requer acompanhamento',
      recommendedAction,
      decision: {
        type: 'REVIEW',
        label: 'Rever manutenção em atraso',
      },
      action: {
        type: 'UPDATE_MAINTENANCE',
        resource: 'maintenance_plans',
        resourceId: plan.id,
        requiresAuthorization: true,
      },
      status: 'OPEN',
      timestamp: now.toISOString(),
      source: {
        resource: 'maintenance_plans',
        resourceId: plan.id,
      },
    };
  }

  private severityWeight(severity: IntelligenceSeverity) {
    switch (severity) {
      case 'CRITICAL':
        return 4;
      case 'HIGH':
        return 3;
      case 'MEDIUM':
        return 2;
      case 'LOW':
      default:
        return 1;
    }
  }
}
