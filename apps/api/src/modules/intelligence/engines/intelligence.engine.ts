import { Injectable } from '@nestjs/common';

import { IntelligenceSeverity, IntelligenceSignal } from '../intelligence.types';
import { OperationalChain } from '../operational-chain.types';

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
        order.status === 'OPEN' && (order.priority === 'HIGH' || order.priority === 'CRITICAL'),
    );

    if (highPriorityOpen.length > 0) {
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
        order.status === 'OPEN' &&
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
      .filter((item) => item.status === 'OPEN' && !item.assigned_to_id)
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
      signals: signals.sort((a, b) => this.compareSignals(a, b)).slice(0, 20),
    };
  }

  private buildProjectOperationalChain(
    project: Project,
    workOrders: WorkOrder[],
    assets: Asset[],
  ): OperationalChain | undefined {
    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && order.status === 'OPEN',
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
      explanation: `A obra ${project.name} tem ${projectWorkOrders.length} ordem(ns) de trabalho aberta(s) relacionadas.`,
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
      (order) => order.asset_id === asset.id && order.status === 'OPEN',
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
          ? `A manutenção vencida está ligada ao ativo ${asset.name}, que tem ${openWorkOrders.length} ordem(ns) de trabalho aberta(s).`
          : `A manutenção vencida está ligada ao ativo ${asset.name}.`,
      impact:
        openWorkOrders.length > 0
          ? 'Existe trabalho operacional aberto no mesmo ativo, aumentando a necessidade de coordenação.'
          : 'A manutenção vencida mantém exposição operacional sobre o ativo.',
      recommendedAction:
        openWorkOrders.length > 0
          ? `Rever a manutenção do ativo ${asset.name} em conjunto com as ordens de trabalho abertas.`
          : `Rever a manutenção vencida do ativo ${asset.name} e confirmar a próxima intervenção.`,
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

  private buildProjectEvidence(project: Project, workOrders: WorkOrder[], now: Date): string[] {
    if (!project.end_date) {
      return [`Progresso registado: ${project.progress}%`];
    }

    const projectWorkOrders = workOrders.filter((order) => order.project_id === project.id);

    const openWorkOrders = projectWorkOrders.filter((order) => order.status === 'OPEN');

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
      (order) => order.project_id === project.id && order.status === 'OPEN',
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
      urgency += ` Existem ${highPriorityOpen.length} ordem(ns) de alta prioridade aberta(s) associada(s).`;
    }

    return urgency;
  }

  private buildProjectImpact(project: Project, workOrders: WorkOrder[], now: Date): string {
    if (!project.end_date) {
      return `O projeto permanece com ${project.progress}% de progresso.`;
    }

    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && order.status === 'OPEN',
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
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${highPriorityOpen.length} ordem(ns) de alta prioridade aberta(s), incluindo ${unassignedHighPriority.length} ordem de alta prioridade sem responsável.`;
    }

    if (highPriorityOpen.length > 0) {
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${highPriorityOpen.length} ordem(ns) de alta prioridade aberta(s).`;
    }

    if (projectWorkOrders.length > 0) {
      return `O projeto está ${overdueDays} dia(s) além da data final registada, com ${projectWorkOrders.length} ordem(ns) de trabalho aberta(s).`;
    }

    return `O projeto está ${overdueDays} dia(s) além da data final registada e permanece com ${project.progress}% de progresso.`;
  }

  private buildProjectRecommendation(project: Project, workOrders: WorkOrder[]): string {
    const projectWorkOrders = workOrders.filter(
      (order) => order.project_id === project.id && order.status === 'OPEN',
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
      title: `${orders.length} ordem(ns) de alta prioridade continuam abertas`,
      explanation:
        'Existem trabalhos classificados como alta prioridade que ainda não foram concluídos.',
      evidence: orders.slice(0, 5).map((order) => order.title),
      urgency:
        orders.length >= 5
          ? `Requer atenção imediata: existem ${orders.length} ordens de alta prioridade abertas.`
          : `Requer atenção hoje: existem ${orders.length} ordem(ns) de alta prioridade abertas.`,
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
      (order) => order.asset_id === plan.assetId && order.status === 'OPEN',
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
      recommendedAction = `Rever primeiro as ${highPriorityAssetWorkOrders.length} ordem(ns) de alta prioridade abertas associadas ao equipamento e confirmar a intervenção de manutenção.`;
    } else if (assetWorkOrders.length > 0) {
      recommendedAction = `Rever as ${assetWorkOrders.length} ordem(ns) de trabalho abertas associadas ao equipamento e confirmar a intervenção de manutenção.`;
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
      evidence,
      urgency:
        overdueDays >= 30
          ? `Requer atenção imediata: a manutenção está há ${overdueDays} dia(s) em atraso.`
          : overdueDays >= 7
            ? `Requer atenção esta semana: a manutenção está há ${overdueDays} dia(s) em atraso.`
            : 'Requer atenção hoje: a data prevista de manutenção já foi ultrapassada.',
      impact:
        assetWorkOrders.length > 0
          ? `A manutenção está ${overdueDays} dia(s) em atraso e existem ${assetWorkOrders.length} ordem(ns) de trabalho aberta(s) associada(s) ao ativo.`
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
    switch (signal.type) {
      case 'OVERDUE_PROJECT':
        if (
          signal.evidence.some((item) =>
            item.includes('Ordens de alta prioridade sem responsável:'),
          )
        ) {
          return 30;
        }

        if (signal.evidence.some((item) => item.includes('Ordens abertas de alta prioridade:'))) {
          return 25;
        }

        if (
          signal.evidence.some((item) => item.includes('Ordens de trabalho abertas associadas:'))
        ) {
          return 20;
        }

        return 15;

      case 'OVERDUE_MAINTENANCE':
        if (signal.evidence.some((item) => item.includes('alta prioridade'))) {
          return 25;
        }

        if (signal.evidence.some((item) => item.includes('ordem(ns) de trabalho aberta(s)'))) {
          return 20;
        }

        return 10;

      case 'STALE_OPEN_WORK_ORDER':
        if (
          signal.severity === 'CRITICAL' &&
          signal.evidence.some((item) => item.includes('Sem responsável atribuído.'))
        ) {
          return 28;
        }

        if (
          signal.severity === 'HIGH' &&
          signal.evidence.some((item) => item.includes('Sem responsável atribuído.'))
        ) {
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
