import { Injectable } from '@nestjs/common';

import type {
  IntelligenceDecisionContext,
  IntelligenceEvidence,
  IntelligenceRecommendation,
  OperationalContext,
} from '../intelligence-contract.types';
import { IntelligenceSeverity, IntelligenceSignal } from '../intelligence.types';
import type { OperationalChain } from '../operational-chain.types';

type WorkOrder = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to_id: string | null;
  project_id: string | null;
  asset_id: string | null;
  updated_at: Date;
};

type WorkOrderContext = {
  project?: Project;
  asset?: Asset;
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

type InventoryMaterial = {
  id: string;
  code: string;
  name: string;
  unit: string;
  reorder_point: number | null;
  reorder_quantity: number | null;
  active: boolean;
};

type InventoryStock = {
  id: string;
  site_id: string;
  material_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
};

type WorkOrderMaterial = {
  id: string;
  work_order_id: string;
  material_id: string;
  site_id: string;
  required_quantity: number;
  reserved_quantity: number;
  consumed_quantity: number;
  status: string;
};

type CooDecisionInput = {
  workOrders: WorkOrder[];
  maintenancePlans: MaintenancePlan[];
  assets: Asset[];
  sites: Site[];
  projects: Project[];
  materials?: InventoryMaterial[];
  inventoryStock?: InventoryStock[];
  workOrderMaterials?: WorkOrderMaterial[];
  now?: Date;
};

@Injectable()
export class CooDecisionEngine {
  private openWorkOrderPhrase(count: number): string {
    return count === 1
      ? 'ordem de trabalho aberta'
      : 'ordens de trabalho abertas';
  }

  private highPriorityOpenWorkOrderPhrase(count: number): string {
    return count === 1
      ? 'ordem de alta prioridade aberta'
      : 'ordens de alta prioridade abertas';
  }

  private highPriorityUnassignedWorkOrderPhrase(count: number): string {
    return count === 1
      ? 'ordem de alta prioridade sem responsável'
      : 'ordens de alta prioridade sem responsável';
  }

  private associatedOpenWorkOrderPhrase(count: number): string {
    return count === 1
      ? 'ordem de trabalho aberta associada'
      : 'ordens de trabalho abertas associadas';
  }

  private associatedHighPriorityWorkOrderPhrase(count: number): string {
    return count === 1
      ? 'ordem de alta prioridade associada'
      : 'ordens de alta prioridade associadas';
  }

  analyze(input: CooDecisionInput) {
    const now = input.now ?? new Date();

    const signals: IntelligenceSignal[] = [];

    const highPriorityOpen = input.workOrders.filter(
      (order) =>
        this.isOpenWorkOrder(order.status) && (order.priority === 'HIGH' || order.priority === 'CRITICAL'),
    );

    const assignedHighPriorityOpen = highPriorityOpen.filter(
      (order) => Boolean(order.assigned_to_id),
    );

    // The per-work-order unassigned signals already represent the complete
    // operational situation when every high-priority open order is unassigned.
    // Keep the aggregate signal only when there is assigned high-priority work
    // that adds distinct operational information.
    if (assignedHighPriorityOpen.length > 0) {
      signals.push(this.createHighPriorityWorkOrderSignal(highPriorityOpen, now));
    }

    const overdueMaintenance = input.maintenancePlans.filter(
      (plan) => plan.status === 'ACTIVE' && plan.nextDue < now,
    );

    for (const plan of overdueMaintenance.slice(0, 10)) {
      signals.push(
        this.createOverdueMaintenanceSignal(plan, input.assets, input.sites, input.workOrders, now),
      );
    }

    const upcomingMaintenance = input.maintenancePlans.filter((plan) => {
      if (plan.status !== 'ACTIVE' || plan.nextDue < now) {
        return false;
      }

      const daysUntilDue =
        (plan.nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      return daysUntilDue <= 30;
    });

    for (const plan of upcomingMaintenance.slice(0, 10)) {
      const assetWorkOrders = input.workOrders.filter(
        (order) =>
          order.asset_id === plan.assetId &&
          this.isOpenWorkOrder(order.status),
      );

      if (assetWorkOrders.length === 0) {
        continue;
      }

      signals.push(
        this.createMaintenanceOperationalConflictSignal(
          plan,
          input.assets,
          input.sites,
          assetWorkOrders,
          now,
        ),
      );
    }

    const stockRiskSignals = this.buildStockRiskSignals(input, now);
    signals.push(...stockRiskSignals);

    const overdueProjects = input.projects.filter(
      (project) => project.progress < 100 && project.end_date !== null && project.end_date < now,
    );

    for (const project of overdueProjects.slice(0, 10)) {
      if (!project.end_date) {
        continue;
      }

      const projectChain = this.buildProjectOperationalChain(
        project,
        input.workOrders,
        input.assets,
      );

      signals.push({
        id: `overdue-project-${project.id}`,
        type: 'OVERDUE_PROJECT',
        severity: project.progress < 50 ? 'CRITICAL' : 'HIGH',
        title: `Projeto fora do prazo — ${project.name}`,
        explanation:
          'O projeto ainda não atingiu 100% de progresso e a data final registada já foi ultrapassada.',
        priorityContext: this.buildProjectPriorityContext(project, input.workOrders),
        evidence: this.buildProjectEvidence(project, input.workOrders, now),
        urgency: this.buildProjectUrgency(project, input.workOrders, now),
        impact: this.buildProjectImpact(project, input.workOrders, now),
        recommendedAction: this.buildProjectRecommendation(project, input.workOrders),
        ...(projectChain ? { chain: projectChain } : {}),
        decision: {
          type: 'REVIEW',
          label: 'Colocar em pausa',
        },
        action: {
          type: 'SET_PROJECT_STATUS',
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

    const staleOpenWorkOrders = input.workOrders.filter(
      (order) =>
        this.isOpenWorkOrder(order.status) &&
        Boolean(order.assigned_to_id) &&
        now.getTime() - order.updated_at.getTime() >= 7 * 24 * 60 * 60 * 1000,
    );

    for (const order of staleOpenWorkOrders.slice(0, 10)) {
      const ageDays = Math.max(
        7,
        Math.floor((now.getTime() - order.updated_at.getTime()) / (24 * 60 * 60 * 1000)),
      );
      const isHighPriority = order.priority === 'HIGH' || order.priority === 'CRITICAL';

      signals.push({
        id: `stale-open-work-order-${order.id}`,
        type: 'STALE_OPEN_WORK_ORDER',
        severity: order.priority === 'CRITICAL' ? 'CRITICAL' : isHighPriority ? 'HIGH' : 'MEDIUM',
        title: `Ordem sem atualização há ${ageDays} dias — ${order.title}`,
        explanation: `Esta ordem de trabalho continua aberta e não regista atualização há ${ageDays} dias.`,
        evidence: [
          `Ordem de trabalho: ${order.title}`,
          `Prioridade: ${order.priority}`,
          `Estado: ${order.status}`,
          `Última atualização: há ${ageDays} dias.`,
        ],
        urgency: `Requer revisão: ordem sem atualização há ${ageDays} dias.`,
        impact:
          'A falta de atualização durante vários dias pode indicar perda de acompanhamento ou necessidade de redefinir a próxima ação.',
        recommendedAction: 'Rever o estado da ordem e confirmar a próxima ação operacional.',
        decision: {
          type: 'REVIEW',
          label: 'Rever ordem',
        },
        status: 'OPEN',
        timestamp: now.toISOString(),
        source: {
          resource: 'work_orders',
          resourceId: order.id,
        },
      });
    }

    for (const order of input.workOrders
      .filter((item) => this.isOpenWorkOrder(item.status) && !item.assigned_to_id)
      .slice(0, 10)) {
      const isHighPriority = order.priority === 'HIGH' || order.priority === 'CRITICAL';
      const context = this.getWorkOrderContext(order, input.projects, input.assets);
      const projectOverdueDays = context.project?.end_date
        ? Math.max(
            0,
            Math.floor(
              (now.getTime() - context.project.end_date.getTime()) / (24 * 60 * 60 * 1000),
            ),
          )
        : 0;

      const contextualEvidence = [
        `Ordem de trabalho: ${order.title}`,
        `Prioridade: ${order.priority}`,
        `Estado: ${order.status}`,
        ...(context.project
          ? [
              `Obra: ${context.project.name}`,
              `Estado da obra: ${context.project.status}`,
              `Progresso da obra: ${context.project.progress}%.`,
              ...(projectOverdueDays > 0 ? [`Obra em atraso: ${projectOverdueDays} dia(s).`] : []),
            ]
          : []),
        ...(context.asset
          ? [
              `Ativo: ${context.asset.name}`,
              ...(context.asset.code ? [`Código do ativo: ${context.asset.code}.`] : []),
              ...(context.asset.status ? [`Estado do ativo: ${context.asset.status}.`] : []),
            ]
          : []),
      ];

      signals.push({
        id: isHighPriority
          ? `unassigned-high-priority-${order.id}`
          : `unassigned-work-order-${order.id}`,
        type: isHighPriority ? 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' : 'UNASSIGNED_WORK_ORDER',
        severity: order.priority === 'CRITICAL' ? 'CRITICAL' : isHighPriority ? 'HIGH' : 'MEDIUM',
        title: isHighPriority
          ? `Ordem de alta prioridade sem responsável — ${order.title}`
          : `Ordem sem responsável — ${order.title}`,
        explanation: isHighPriority
          ? 'Esta ordem de trabalho de alta prioridade ainda não tem um responsável atribuído.'
          : 'Esta ordem de trabalho aberta ainda não tem um responsável atribuído.',
        priorityContext: {
          openWorkOrders: 1,
          highPriorityOpenWorkOrders: isHighPriority ? 1 : 0,
          unassignedHighPriorityWorkOrders: isHighPriority ? 1 : 0,
        },
        evidence: contextualEvidence,
        urgency:
          context.project && projectOverdueDays > 0
            ? `Requer atenção hoje: ordem ${isHighPriority ? 'de alta prioridade ' : ''}sem responsável numa obra já em atraso há ${projectOverdueDays} dia(s).`
            : context.project
              ? `Requer atenção hoje: ordem ${isHighPriority ? 'de alta prioridade ' : ''}sem responsável associada à obra ${context.project.name}.`
              : isHighPriority
                ? 'Requer atenção hoje: prioridade alta sem responsável atribuído.'
                : 'Requer atenção: ordem aberta sem responsável atribuído.',
        impact:
          context.project && projectOverdueDays > 0
            ? `A ordem permanece sem responsável numa obra que já está atrasada ${projectOverdueDays} dia(s), aumentando o risco de prolongar o atraso.`
            : context.project
              ? `A ordem permanece sem responsável no contexto da obra ${context.project.name}, aumentando o risco de perda de acompanhamento operacional.`
              : isHighPriority
                ? 'Esta ordem de trabalho de alta prioridade permanece sem um responsável atribuído, deixando a responsabilidade operacional por definir.'
                : 'Esta ordem de trabalho permanece sem um responsável atribuído, deixando a responsabilidade operacional por definir.',
        recommendedAction: context.project
          ? `Atribuir um responsável à ordem e confirmar a próxima ação para proteger o acompanhamento da obra ${context.project.name}.`
          : 'Atribuir um responsável e confirmar a próxima ação operacional.',
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
        .sort((a, b) => this.compareSignals(a, b))
        .slice(0, 20)
        .map((signal) => this.withOperationalContract(signal, input)),
    };
  }

  private buildProjectOperationalChain(
    project: Project,
    workOrders: WorkOrder[],
    assets: Asset[],
  ): OperationalChain | undefined {
    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && this.isOpenWorkOrder(order.status),
    );

    if (projectWorkOrders.length === 0) {
      return undefined;
    }

    const projectNode = {
      type: 'PROJECT' as const,
      id: project.id,
      label: project.name,
      state: project.status,
    };

    const nodes: OperationalChain['nodes'] = [projectNode];
    const edges: OperationalChain['edges'] = [];

    for (const workOrder of projectWorkOrders.slice(0, 5)) {
      const workOrderNode = {
        type: 'WORK_ORDER' as const,
        id: workOrder.id,
        label: workOrder.title,
        state: workOrder.status,
      };

      nodes.push(workOrderNode);
      edges.push({
        from: projectNode,
        to: workOrderNode,
        relationship: 'tem ordem de trabalho',
      });

      if (workOrder.asset_id) {
        const asset = assets.find((candidate) => candidate.id === workOrder.asset_id);

        if (asset) {
          const assetNode = {
            type: 'ASSET' as const,
            id: asset.id,
            label: asset.name,
            state: asset.status,
          };

          if (!nodes.some((node) => node.type === 'ASSET' && node.id === asset.id)) {
            nodes.push(assetNode);
          }

          edges.push({
            from: workOrderNode,
            to: assetNode,
            relationship: 'afeta ativo',
          });
        }
      }
    }

    return {
      id: `chain-project-${project.id}`,
      title: 'Obra → ordens de trabalho → ativos',
      explanation: `A obra ${project.name} tem ${projectWorkOrders.length} ${this.openWorkOrderPhrase(projectWorkOrders.length)} relacionadas.`,
      impact:
        'As ordens abertas representam trabalho operacional ainda pendente dentro do contexto da obra.',
      recommendedAction:
        'Rever as ordens abertas no contexto da obra e confirmar as próximas ações prioritárias.',
      nodes,
      edges,
    };
  }

  private buildMaintenanceAssetChain(
    maintenance: MaintenancePlan,
    asset: Asset,
    workOrders: WorkOrder[],
    site?: Site,
  ): OperationalChain {
    const maintenanceNode = {
      type: 'MAINTENANCE' as const,
      id: maintenance.id,
      label: maintenance.plan,
      state: maintenance.status,
    };

    const assetNode = {
      type: 'ASSET' as const,
      id: asset.id,
      label: asset.name,
      state: asset.status,
    };

    const nodes: OperationalChain['nodes'] = [maintenanceNode, assetNode];
    const edges: OperationalChain['edges'] = [
      {
        from: maintenanceNode,
        to: assetNode,
        relationship: 'afeta ativo',
      },
    ];

    const openWorkOrders = workOrders.filter(
      (order) => order.asset_id === asset.id && this.isOpenWorkOrder(order.status),
    );

    for (const order of openWorkOrders.slice(0, 3)) {
      const workOrderNode = {
        type: 'WORK_ORDER' as const,
        id: order.id,
        label: order.title,
        state: order.status,
      };

      nodes.push(workOrderNode);
      edges.push({
        from: assetNode,
        to: workOrderNode,
        relationship: 'tem ordem de trabalho aberta',
      });
    }

    if (site) {
      const siteNode = {
        type: 'SITE' as const,
        id: site.id,
        label: site.name,
        state: undefined,
      };

      nodes.push(siteNode);
      edges.push({
        from: assetNode,
        to: siteNode,
        relationship: 'está localizado em',
      });
    }

    return {
      id: `chain-maintenance-${maintenance.id}-asset-${asset.id}`,
      title: site ? 'Manutenção → ativo → ordens → local' : 'Manutenção → ativo → ordens',
      explanation:
        openWorkOrders.length > 0
          ? `A manutenção está associada ao ativo ${asset.name}, que tem ${openWorkOrders.length} ${this.openWorkOrderPhrase(openWorkOrders.length)}.`
          : `A manutenção está associada ao ativo ${asset.name}.`,
      impact:
        openWorkOrders.length > 0
          ? 'Existe trabalho operacional aberto no mesmo ativo, aumentando a necessidade de coordenação.'
          : 'A manutenção mantém exposição operacional sobre o ativo.',
      recommendedAction:
        openWorkOrders.length > 0
          ? `Rever a manutenção do ativo ${asset.name} em conjunto com as ordens de trabalho abertas.`
          : `Rever a manutenção do ativo ${asset.name} e confirmar a próxima intervenção.`,
      nodes,
      edges,
    };
  }

  private getWorkOrderContext(
    order: WorkOrder,
    projects: Project[],
    assets: Asset[],
  ): WorkOrderContext {
    return {
      project: order.project_id
        ? projects.find((project) => project.id === order.project_id)
        : undefined,
      asset: order.asset_id ? assets.find((asset) => asset.id === order.asset_id) : undefined,
    };
  }

  private buildProjectPriorityContext(
    project: Project,
    workOrders: WorkOrder[],
  ): NonNullable<IntelligenceSignal['priorityContext']> {
    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id,
    );

    const openWorkOrders = projectWorkOrders.filter(
      (order) => this.isOpenWorkOrder(order.status),
    );

    const highPriorityOpenWorkOrders = openWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const unassignedHighPriorityWorkOrders = highPriorityOpenWorkOrders.filter(
      (order) => !order.assigned_to_id,
    );

    return {
      relatedOpenWorkOrders: openWorkOrders.length,
      openWorkOrders: openWorkOrders.length,
      highPriorityOpenWorkOrders: highPriorityOpenWorkOrders.length,
      unassignedHighPriorityWorkOrders: unassignedHighPriorityWorkOrders.length,
    };
  }

  private buildProjectEvidence(project: Project, workOrders: WorkOrder[], now: Date): string[] {
    if (!project.end_date) {
      return [`Progresso registado: ${project.progress}%`];
    }

    const projectWorkOrders = workOrders.filter((order) => order.project_id === project.id);

    const openWorkOrders = projectWorkOrders.filter((order) => this.isOpenWorkOrder(order.status));

    const highPriorityOpen = openWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const unassignedHighPriority = highPriorityOpen.filter((order) => !order.assigned_to_id);

    const overdueDays = Math.max(
      1,
      Math.floor((now.getTime() - project.end_date.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const evidence = [
      `Progresso registado: ${project.progress}%`,
      `Data final: ${project.end_date.toISOString()}`,
      `Atraso registado: ${overdueDays} dia(s)`,
    ];

    if (openWorkOrders.length > 0) {
      evidence.push(`Ordens de trabalho abertas associadas: ${openWorkOrders.length}`);
    }

    if (highPriorityOpen.length > 0) {
      evidence.push(`Ordens abertas de alta prioridade: ${highPriorityOpen.length}`);
    }

    if (unassignedHighPriority.length > 0) {
      evidence.push(`Ordens de alta prioridade sem responsável: ${unassignedHighPriority.length}`);
    }

    return evidence;
  }

  private buildProjectUrgency(project: Project, workOrders: WorkOrder[], now: Date): string {
    if (!project.end_date) {
      return 'Requer atenção hoje.';
    }

    const overdueDays = Math.max(
      1,
      Math.floor((now.getTime() - project.end_date.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && this.isOpenWorkOrder(order.status),
    );

    const highPriorityOpen = projectWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    let urgency =
      overdueDays >= 30
        ? `Requer atenção imediata: o projeto está há ${overdueDays} dia(s) além da data final.`
        : overdueDays >= 7
          ? `Requer atenção esta semana: o projeto está há ${overdueDays} dia(s) além da data final.`
          : 'Requer atenção hoje: a data final já foi ultrapassada.';

    if (highPriorityOpen.length > 0) {
      urgency += ` Existem ${highPriorityOpen.length} ${this.associatedHighPriorityWorkOrderPhrase(highPriorityOpen.length)}.`;
    }

    return urgency;
  }

  private buildProjectImpact(project: Project, workOrders: WorkOrder[], now: Date): string {
    if (!project.end_date) {
      return `O projeto permanece com ${project.progress}% de progresso.`;
    }

    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && this.isOpenWorkOrder(order.status),
    );

    const highPriorityOpen = projectWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const unassignedHighPriority = highPriorityOpen.filter((order) => !order.assigned_to_id);

    const overdueDays = Math.max(
      1,
      Math.floor((now.getTime() - project.end_date.getTime()) / (1000 * 60 * 60 * 24)),
    );

    if (unassignedHighPriority.length > 0) {
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${highPriorityOpen.length} ${this.highPriorityOpenWorkOrderPhrase(highPriorityOpen.length)}, incluindo ${unassignedHighPriority.length} ${this.highPriorityUnassignedWorkOrderPhrase(unassignedHighPriority.length)}.`;
    }

    if (highPriorityOpen.length > 0) {
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${highPriorityOpen.length} ${this.highPriorityOpenWorkOrderPhrase(highPriorityOpen.length)}.`;
    }

    if (projectWorkOrders.length > 0) {
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${projectWorkOrders.length} ${this.openWorkOrderPhrase(projectWorkOrders.length)}.`;
    }

    return `O projeto está ${overdueDays} dia(s) além da data final registada e permanece com ${project.progress}% de progresso.`;
  }

  private buildProjectRecommendation(project: Project, workOrders: WorkOrder[]): string {
    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && this.isOpenWorkOrder(order.status),
    );

    const highPriorityOpen = projectWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const unassignedHighPriority = highPriorityOpen.filter((order) => !order.assigned_to_id);

    if (unassignedHighPriority.length > 0) {
      return 'Priorizar hoje a atribuição de responsável às ordens de alta prioridade sem responsável e rever o plano de recuperação do projeto.';
    }

    if (highPriorityOpen.length > 0) {
      return 'Rever hoje as ordens de alta prioridade abertas e confirmar o plano de recuperação do projeto.';
    }

    if (projectWorkOrders.length > 0) {
      return 'Rever as ordens de trabalho abertas e confirmar a próxima ação para recuperar o prazo do projeto.';
    }

    return 'Rever o plano do projeto e definir a ação necessária para recuperar o prazo.';
  }

  private createHighPriorityWorkOrderSignal(orders: WorkOrder[], now: Date): IntelligenceSignal {
    return {
      id: `high-priority-work-orders-${orders.length}`,
      type: 'HIGH_PRIORITY_WORK_ORDER',
      severity:
        orders.some((order) => order.priority === 'CRITICAL') || orders.length >= 5
          ? 'CRITICAL'
          : 'HIGH',
      title: `${orders.length} ${this.highPriorityOpenWorkOrderPhrase(orders.length)}`,
      explanation:
        'Existem trabalhos classificados como alta prioridade que ainda não foram concluídos.',
      evidence: orders.slice(0, 5).map((order) => order.title),
      urgency:
        orders.length >= 5
          ? `Requer atenção imediata: existem ${orders.length} ordens de alta prioridade abertas.`
          : `Requer atenção hoje: existem ${orders.length} ${this.highPriorityOpenWorkOrderPhrase(orders.length)}.`,
      impact:
        'Existem ordens de trabalho de alta prioridade que continuam abertas e requerem resolução operacional.',
      recommendedAction:
        'Rever as ordens de alta prioridade e confirmar responsável, estado e próxima ação.',
      decision: {
        type: 'REVIEW',
        label: 'Rever ordens prioritárias',
      },
      status: 'OPEN',
      timestamp: now.toISOString(),
      source: {
        resource: 'work_orders',
      },
    };
  }

  private createMaintenanceOperationalConflictSignal(
    plan: MaintenancePlan,
    assets: Asset[],
    sites: Site[],
    assetWorkOrders: WorkOrder[],
    now: Date,
  ): IntelligenceSignal {
    const daysUntilDue = Math.max(
      0,
      Math.ceil(
        (plan.nextDue.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const highPriorityAssetWorkOrders = assetWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const asset = assets.find((item) => item.id === plan.assetId);

    const site = asset?.site_id
      ? sites.find((item) => item.id === asset.site_id)
      : undefined;

    const severity: IntelligenceSeverity =
      highPriorityAssetWorkOrders.length > 0 ? 'HIGH' : 'MEDIUM';

    const title = asset
      ? `Manutenção próxima com conflito operacional — ${asset.name}`
      : `Manutenção próxima com conflito operacional — ${plan.plan}`;

    const evidence = [
      `Data prevista: ${plan.nextDue.toISOString()}`,
      `Faltam ${daysUntilDue} dia(s) para a intervenção`,
      `Ordens de trabalho abertas associadas: ${assetWorkOrders.length}`,
    ];

    if (asset) {
      evidence.unshift(`Equipamento: ${asset.name} (${asset.code})`);
    }

    if (site) {
      evidence.push(`Site associado: ${site.name} (${site.code})`);
    }

    if (highPriorityAssetWorkOrders.length > 0) {
      evidence.push(
        `Ordens abertas de alta prioridade: ${highPriorityAssetWorkOrders.length}`,
      );
    }

    const recommendedAction =
      highPriorityAssetWorkOrders.length > 0
        ? `Rever primeiro as ${highPriorityAssetWorkOrders.length} ${this.highPriorityOpenWorkOrderPhrase(highPriorityAssetWorkOrders.length)} ${highPriorityAssetWorkOrders.length === 1 ? 'associada' : 'associadas'} ao equipamento e coordenar a intervenção de manutenção.`
        : `Coordenar as ${assetWorkOrders.length} ${this.openWorkOrderPhrase(assetWorkOrders.length)} com a intervenção de manutenção prevista.`;

    const maintenanceAsset = asset;

    const maintenanceChain = maintenanceAsset
      ? this.buildMaintenanceAssetChain(
          plan,
          maintenanceAsset,
          assetWorkOrders,
          site,
        )
      : undefined;

    return {
      id: `maintenance-operational-conflict-${plan.id}`,
      type: 'MAINTENANCE_OPERATIONAL_CONFLICT',
      severity,
      title,
      explanation:
        'Uma intervenção de manutenção está prevista nos próximos 30 dias e existem ordens de trabalho abertas associadas ao mesmo equipamento.',
      priorityContext: {
        openWorkOrders: assetWorkOrders.length,
        highPriorityOpenWorkOrders: highPriorityAssetWorkOrders.length,
      },
      evidence,
      urgency:
        highPriorityAssetWorkOrders.length > 0
          ? `Requer coordenação prioritária: existem ${highPriorityAssetWorkOrders.length} ${this.associatedHighPriorityWorkOrderPhrase(highPriorityAssetWorkOrders.length)} ao equipamento.`
          : daysUntilDue <= 7
            ? 'Requer coordenação esta semana: a manutenção aproxima-se e existem ordens de trabalho abertas associadas.'
            : 'Requer coordenação: a manutenção aproxima-se e existem ordens de trabalho abertas associadas.',
      impact:
        highPriorityAssetWorkOrders.length > 0
          ? `A intervenção de manutenção aproxima-se e pode interferir com ${assetWorkOrders.length} ${this.openWorkOrderPhrase(assetWorkOrders.length)}, incluindo ${highPriorityAssetWorkOrders.length} de alta prioridade.`
          : `A intervenção de manutenção aproxima-se e pode interferir com ${assetWorkOrders.length} ${this.openWorkOrderPhrase(assetWorkOrders.length)} no mesmo equipamento.`,
      recommendedAction,
      ...(maintenanceChain ? { chain: maintenanceChain } : {}),
      decision: {
        type: 'REVIEW',
        label: 'Coordenar manutenção e operação',
      },
      status: 'OPEN',
      timestamp: now.toISOString(),
      source: {
        resource: 'maintenance_plans',
        resourceId: plan.id,
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
      Math.floor((now.getTime() - plan.nextDue.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const severity: IntelligenceSeverity = overdueDays >= 30 ? 'HIGH' : 'MEDIUM';

    const asset = assets.find((item) => item.id === plan.assetId);

    const site = asset?.site_id ? sites.find((item) => item.id === asset.site_id) : undefined;

    const assetWorkOrders = workOrders.filter(
      (order) => order.asset_id === plan.assetId && this.isOpenWorkOrder(order.status),
    );

    const highPriorityAssetWorkOrders = assetWorkOrders.filter(
      (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
    );

    const title = asset
      ? `Manutenção em atraso — ${asset.name}`
      : `Manutenção em atraso — ${plan.plan}`;

    const evidence = [
      `Data prevista: ${plan.nextDue.toISOString()}`,
      `Atraso: ${overdueDays} dia(s)`,
    ];

    if (asset) {
      evidence.unshift(`Equipamento: ${asset.name} (${asset.code})`);

      if (site) {
        evidence.push(`Site associado: ${site.name} (${site.code})`);
      }
    }

    if (assetWorkOrders.length > 0) {
      evidence.push(`Ordens de trabalho abertas associadas: ${assetWorkOrders.length}`);
    }

    if (highPriorityAssetWorkOrders.length > 0) {
      evidence.push(`Ordens abertas de alta prioridade: ${highPriorityAssetWorkOrders.length}`);
    }

    let recommendedAction =
      'Agendar ou atualizar a intervenção de manutenção e confirmar o próximo passo.';

    if (highPriorityAssetWorkOrders.length > 0) {
      recommendedAction = `Rever primeiro as ${highPriorityAssetWorkOrders.length} ${this.highPriorityOpenWorkOrderPhrase(highPriorityAssetWorkOrders.length)} ${highPriorityAssetWorkOrders.length === 1 ? 'associada' : 'associadas'} ao equipamento e confirmar a intervenção de manutenção.`;
    } else if (assetWorkOrders.length > 0) {
      recommendedAction = `Rever as ${assetWorkOrders.length} ${this.associatedOpenWorkOrderPhrase(assetWorkOrders.length)} ao equipamento e confirmar a intervenção de manutenção.`;
    }

    const maintenanceAsset = assets.find((asset) => asset.id === plan.assetId);

    const maintenanceSite = maintenanceAsset?.site_id
      ? sites.find((site) => site.id === maintenanceAsset.site_id)
      : undefined;

    const maintenanceChain = maintenanceAsset
      ? this.buildMaintenanceAssetChain(plan, maintenanceAsset, workOrders, maintenanceSite)
      : undefined;

    return {
      id: `overdue-maintenance-${plan.id}`,
      type: 'OVERDUE_MAINTENANCE',
      severity,
      title,
      explanation: 'Um plano de manutenção ativo ultrapassou a data prevista de intervenção.',
      priorityContext: {
        openWorkOrders: assetWorkOrders.length,
        highPriorityOpenWorkOrders: highPriorityAssetWorkOrders.length,
      },
      evidence,
      urgency:
        overdueDays >= 30
          ? `Requer atenção imediata: a manutenção está há ${overdueDays} dia(s) em atraso.`
          : overdueDays >= 7
            ? `Requer atenção esta semana: a manutenção está há ${overdueDays} dia(s) em atraso.`
            : 'Requer atenção hoje: a data prevista de manutenção já foi ultrapassada.',
      impact:
        assetWorkOrders.length > 0
          ? `A manutenção está ${overdueDays} dia(s) em atraso e existem ${assetWorkOrders.length} ${this.associatedOpenWorkOrderPhrase(assetWorkOrders.length)} ao ativo.`
          : `A manutenção está ${overdueDays} dia(s) em atraso.`,
      recommendedAction,
      ...(maintenanceChain ? { chain: maintenanceChain } : {}),
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

  private buildStockRiskSignals(
    input: CooDecisionInput,
    now: Date,
  ): IntelligenceSignal[] {
    const materials = input.materials ?? [];
    const inventoryStock = input.inventoryStock ?? [];
    const workOrderMaterials = input.workOrderMaterials ?? [];

    if (materials.length === 0) {
      return [];
    }

    const openWorkOrderIds = new Set(
      input.workOrders
        .filter((order) => this.isOpenWorkOrder(order.status))
        .map((order) => order.id),
    );

    const stockByKey = new Map(
      inventoryStock.map((stock) => [
        `${stock.site_id}:${stock.material_id}`,
        stock,
      ]),
    );

    const demandByKey = new Map<string, number>();

    for (const workOrderMaterial of workOrderMaterials) {
      if (!openWorkOrderIds.has(workOrderMaterial.work_order_id)) {
        continue;
      }

      const remainingDemand = Math.max(
        0,
        workOrderMaterial.required_quantity -
          workOrderMaterial.reserved_quantity -
          workOrderMaterial.consumed_quantity,
      );

      if (remainingDemand <= 0) {
        continue;
      }

      const key = `${workOrderMaterial.site_id}:${workOrderMaterial.material_id}`;
      demandByKey.set(
        key,
        (demandByKey.get(key) ?? 0) + remainingDemand,
      );
    }

    const sitesById = new Map(input.sites.map((site) => [site.id, site]));

    const signals: IntelligenceSignal[] = [];

    for (const material of materials) {
      if (!material.active || material.reorder_point === null) {
        continue;
      }

      const relevantSiteIds = new Set<string>();

      for (const stock of inventoryStock) {
        if (stock.material_id === material.id) {
          relevantSiteIds.add(stock.site_id);
        }
      }

      for (const workOrderMaterial of workOrderMaterials) {
        if (
          workOrderMaterial.material_id === material.id &&
          openWorkOrderIds.has(workOrderMaterial.work_order_id)
        ) {
          relevantSiteIds.add(workOrderMaterial.site_id);
        }
      }

      for (const siteId of relevantSiteIds) {
        const key = `${siteId}:${material.id}`;
        const stock = stockByKey.get(key);
        const onHand = stock?.quantity_on_hand ?? 0;
        const reserved = stock?.quantity_reserved ?? 0;
        const available = onHand - reserved;
        const outstandingDemand = demandByKey.get(key) ?? 0;
        const projectedAvailable = available - outstandingDemand;

        if (available > material.reorder_point && projectedAvailable > material.reorder_point) {
          continue;
        }

        const site = sitesById.get(siteId);

        const severity: IntelligenceSeverity =
          projectedAvailable < 0
            ? 'CRITICAL'
            : projectedAvailable <= material.reorder_point
              ? outstandingDemand > 0
                ? 'HIGH'
                : 'MEDIUM'
              : 'MEDIUM';

        const title = `Stock em risco — ${material.name} · ${site?.name ?? siteId}`;

        const evidence = [
          `Material: ${material.name} (${material.code})`,
          `Site: ${site?.name ?? siteId}`,
          `Stock físico: ${onHand} ${material.unit}`,
          `Stock reservado: ${reserved} ${material.unit}`,
          `Stock disponível: ${available} ${material.unit}`,
          `Procura pendente: ${outstandingDemand} ${material.unit}`,
          `Disponibilidade projetada: ${projectedAvailable} ${material.unit}`,
          `Ponto de reposição: ${material.reorder_point} ${material.unit}`,
        ];

        if (material.reorder_quantity !== null) {
          evidence.push(
            `Quantidade de reposição configurada: ${material.reorder_quantity} ${material.unit}`,
          );
        }

        const urgency =
          projectedAvailable < 0
            ? `Requer atenção imediata: faltam ${Math.abs(projectedAvailable)} ${material.unit} para cobrir a procura operacional pendente.`
            : outstandingDemand > 0
              ? 'Requer revisão prioritária: a disponibilidade projetada está no ou abaixo do ponto de reposição.'
              : 'Requer revisão: o stock disponível está no ou abaixo do ponto de reposição.';

        const impact =
          projectedAvailable < 0
            ? `A disponibilidade atual não cobre a procura pendente de ${outstandingDemand} ${material.unit}, criando risco operacional para ordens de trabalho abertas.`
            : `A posição de stock para este material está no ou abaixo do ponto de reposição e pode comprometer a continuidade operacional se não houver reposição.`;

        signals.push({
          id: `stock-risk-${siteId}-${material.id}`,
          type: 'STOCK_RISK',
          severity,
          priorityContext: {
            openWorkOrders: workOrderMaterials.filter(
              (item) =>
                item.site_id === siteId &&
                item.material_id === material.id &&
                openWorkOrderIds.has(item.work_order_id),
            ).length,
          },
          title,
          explanation:
            'A posição de stock está abaixo do nível operacional definido para reposição.',
          evidence,
          urgency,
          impact,
          recommendedAction:
            `Rever o aprovisionamento de ${material.name} para ${site?.name ?? siteId} e confirmar a próxima reposição.`,
          decision: {
            type: 'REVIEW',
            label: 'Rever aprovisionamento',
          },
          status: 'OPEN',
          timestamp: now.toISOString(),
          stockRiskContext: {
            siteId,
            materialId: material.id,
          },
          source: {
            resource: 'inventory_stock',
            resourceId: stock?.id,
          },
        });
      }
    }

    return signals;
  }

  private isOpenWorkOrder(status: string): boolean {
    return !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(status.toUpperCase());
  }

  private buildEvidenceItems(
    evidence: string[],
    source: IntelligenceSignal['source'],
  ): IntelligenceEvidence[] {
    return evidence.map((value, index) => ({
      id: `${source.resource}:${source.resourceId ?? 'unknown'}:evidence:${index + 1}`,
      kind: 'FACT',
      label: value,
      value,
      source,
    }));
  }

  private buildRecommendations(
    signal: IntelligenceSignal,
  ): IntelligenceRecommendation[] {
    if (!signal.action) {
      return [
        {
          id: `${signal.id}:recommendation:monitor`,
          type: 'MONITOR',
          title: 'Monitorizar operação',
          explanation: signal.recommendedAction,
          resource: signal.source.resource,
          resourceId: signal.source.resourceId ?? '',
          executable: false,
        },
      ];
    }

    const type: IntelligenceRecommendation['type'] =
      signal.action.type === 'ASSIGN_WORK_ORDER'
        ? 'ASSIGN'
        : signal.action.type === 'UPDATE_MAINTENANCE'
          ? 'RESCHEDULE'
          : signal.action.type === 'SET_PROJECT_STATUS'
            ? 'UPDATE_STATUS'
            : 'REVIEW';

    return [
      {
        id: `${signal.id}:recommendation:1`,
        type,
        title: 'Ação recomendada pelo Astra',
        explanation: signal.recommendedAction,
        resource: signal.action.resource,
        resourceId: signal.action.resourceId,
        executable: true,
      },
    ];
  }

  private buildOperationalContext(
    signal: IntelligenceSignal,
    input: CooDecisionInput,
  ): OperationalContext {
    const resourceId = signal.source.resourceId;
    const resource = signal.source.resource;

    const context: OperationalContext = {
      workOrders: {
        open: 0,
        highPriorityOpen: 0,
        unassignedHighPriority: 0,
      },
    };

    if (signal.chain) {
      context.chain = signal.chain;
    }

    const setWorkOrderContext = (workOrders: CooDecisionInput['workOrders']) => {
      const openWorkOrders = workOrders.filter((order) =>
        this.isOpenWorkOrder(order.status),
      );

      const highPriorityOpenWorkOrders = openWorkOrders.filter(
        (order) => order.priority === 'HIGH' || order.priority === 'CRITICAL',
      );

      const unassignedHighPriorityWorkOrders =
        highPriorityOpenWorkOrders.filter((order) => !order.assigned_to_id);

      context.workOrders = {
        open: openWorkOrders.length,
        highPriorityOpen: highPriorityOpenWorkOrders.length,
        unassignedHighPriority: unassignedHighPriorityWorkOrders.length,
      };
    };

    if (resource === 'projects' && resourceId) {
      const project = input.projects.find((item) => item.id === resourceId);

      if (project) {
        context.project = {
          id: project.id,
          name: project.name,
        };
      }

      setWorkOrderContext(
        input.workOrders.filter((order) => order.project_id === resourceId),
      );

      return context;
    }

    if (resource === 'work_orders' && resourceId) {
      const workOrder = input.workOrders.find((item) => item.id === resourceId);

      if (!workOrder) {
        return context;
      }

      setWorkOrderContext(
        input.workOrders.filter(
          (order) =>
            order.id === resourceId ||
            (workOrder.project_id !== null &&
              order.project_id === workOrder.project_id) ||
            (workOrder.asset_id !== null &&
              order.asset_id === workOrder.asset_id),
        ),
      );

      if (workOrder.project_id) {
        const project = input.projects.find(
          (item) => item.id === workOrder.project_id,
        );

        if (project) {
          context.project = {
            id: project.id,
            name: project.name,
          };
        }
      }

      if (workOrder.asset_id) {
        const asset = input.assets.find(
          (item) => item.id === workOrder.asset_id,
        );

        if (asset) {
          context.asset = {
            id: asset.id,
            name: asset.name,
          };

          if (asset.site_id) {
            const site = input.sites.find(
              (item) => item.id === asset.site_id,
            );

            if (site) {
              context.site = {
                id: site.id,
                name: site.name,
              };
            }
          }
        }
      }

      return context;
    }

    if (resource === 'inventory_stock') {
      const stockMetadata = signal.stockRiskContext;

      const selectedStock = resourceId
        ? input.inventoryStock?.find((item) => item.id === resourceId)
        : stockMetadata
          ? (input.inventoryStock ?? []).find(
              (item) =>
                item.site_id === stockMetadata.siteId &&
                item.material_id === stockMetadata.materialId,
            )
          : undefined;

      const materialId =
        stockMetadata?.materialId ?? selectedStock?.material_id;
      const siteId = stockMetadata?.siteId ?? selectedStock?.site_id;

      if (!materialId || !siteId) {
        return context;
      }

      const material = input.materials?.find(
        (item) => item.id === materialId,
      );
      const site = input.sites.find((item) => item.id === siteId);

      if (!material || !site || material.reorder_point === null) {
        return context;
      }

      const onHand = selectedStock?.quantity_on_hand ?? 0;
      const reserved = selectedStock?.quantity_reserved ?? 0;
      const available = onHand - reserved;

      const outstandingDemand = (input.workOrderMaterials ?? [])
        .filter(
          (item) =>
            item.material_id === materialId &&
            item.site_id === siteId &&
            this.isOpenWorkOrder(
              input.workOrders.find(
                (order) => order.id === item.work_order_id,
              )?.status ?? 'CLOSED',
            ),
        )
        .reduce(
          (total, item) =>
            total +
            Math.max(
              0,
              item.required_quantity -
                item.reserved_quantity -
                item.consumed_quantity,
            ),
          0,
        );

      context.site = {
        id: site.id,
        name: site.name,
      };

      context.inventory = {
        material: {
          id: material.id,
          name: material.name,
          code: material.code,
          unit: material.unit,
        },
        site: {
          id: site.id,
          name: site.name,
          code: site.code,
        },
        onHand,
        reserved,
        available,
        outstandingDemand,
        projectedAvailable: available - outstandingDemand,
        reorderPoint: material.reorder_point,
        ...(material.reorder_quantity !== null
          ? { reorderQuantity: material.reorder_quantity }
          : {}),
      };

      return context;
    }

    if (resource === 'maintenance_plans' && resourceId) {
      const maintenance = input.maintenancePlans.find(
        (item) => item.id === resourceId,
      );

      if (!maintenance) {
        return context;
      }

      context.maintenance = {
        id: maintenance.id,
        nextDue: maintenance.nextDue.toISOString(),
      };

      const asset = input.assets.find(
        (item) => item.id === maintenance.assetId,
      );

      if (!asset) {
        return context;
      }

      context.asset = {
        id: asset.id,
        name: asset.name,
      };

      if (asset.site_id) {
        const site = input.sites.find(
          (item) => item.id === asset.site_id,
        );

        if (site) {
          context.site = {
            id: site.id,
            name: site.name,
          };
        }
      }

      setWorkOrderContext(
        input.workOrders.filter((order) => order.asset_id === asset.id),
      );

      return context;
    }

    setWorkOrderContext(input.workOrders);

    return context;
  }

  private withOperationalContract(
    signal: IntelligenceSignal,
    input: CooDecisionInput,
  ): IntelligenceSignal {
    const evidenceItems = this.buildEvidenceItems(
      signal.evidence,
      signal.source,
    );
    const recommendations = this.buildRecommendations(signal);
    const operationalContext = this.buildOperationalContext(signal, input);

    const decisionContext: IntelligenceDecisionContext = {
      evidence: evidenceItems,
      operationalContext,
      recommendations,
      confidence: 1,
    };

    return {
      ...signal,
      evidenceItems,
      operationalContext,
      recommendations,
      decisionContext,
    };
  }

  private compareSignals(a: IntelligenceSignal, b: IntelligenceSignal) {
    const severityDifference = this.severityWeight(b.severity) - this.severityWeight(a.severity);

    if (severityDifference !== 0) {
      return severityDifference;
    }

    const operationalPriorityDifference = this.operationalPriority(b) - this.operationalPriority(a);

    if (operationalPriorityDifference !== 0) {
      return operationalPriorityDifference;
    }

    const timestampDifference = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    return a.id.localeCompare(b.id);
  }

  private operationalPriority(signal: IntelligenceSignal) {
    const context = signal.priorityContext;

    switch (signal.type) {
      case 'OVERDUE_PROJECT':
        if (context?.unassignedHighPriorityWorkOrders) {
          return 30;
        }

        if (context?.highPriorityOpenWorkOrders) {
          return 25;
        }

        if (context?.openWorkOrders) {
          return 20;
        }

        return 15;

      case 'OVERDUE_MAINTENANCE':
        if (context?.highPriorityOpenWorkOrders) {
          return 25;
        }

        if (context?.openWorkOrders) {
          return 20;
        }

        return 10;

      case 'STALE_OPEN_WORK_ORDER':
        if (signal.severity === 'CRITICAL') {
          return 28;
        }

        if (signal.severity === 'HIGH') {
          return 26;
        }

        if (signal.severity === 'MEDIUM') {
          return 12;
        }

        return 18;

      case 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER':
        return 25;

      case 'UNASSIGNED_WORK_ORDER':
        return 10;

      case 'HIGH_PRIORITY_WORK_ORDER':
        return 15;

      case 'STOCK_RISK':
        if (signal.severity === 'CRITICAL') {
          return 32;
        }

        if (signal.severity === 'HIGH') {
          return 27;
        }

        if (signal.severity === 'MEDIUM') {
          return 16;
        }

        return 8;

      default:
        return 0;
    }
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
