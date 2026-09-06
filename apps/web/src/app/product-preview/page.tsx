import { ActivityFeed } from '@/components/dashboard/activity/activity-feed';
import { AssetHealth } from '@/components/dashboard/assets/asset-health';
import { OperationsChart } from '@/components/dashboard/charts/operations-chart';
import { ExecutiveSummary } from '@/components/dashboard/executive/executive-summary';
import { AiPanel } from '@/components/dashboard/intelligence/ai-panel';
import { KpiGrid } from '@/components/dashboard/kpis/kpi-grid';
import { AlertsCenter } from '@/components/dashboard/notifications/alerts-center';
import { ProjectStatus } from '@/components/dashboard/projects/project-status';
import { ReportCenter } from '@/components/dashboard/reports/report-center';
import { RiskPanel } from '@/components/dashboard/risk/risk-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function ProductPreviewPage() {
  const overview = {
    customers: 24,
    sites: 8,
    assets: 186,
    workOrders: {
      open: 37,
      highPriority: 5,
    },
    assetHealth: {
      active: 171,
      total: 186,
    },
    maintenance: {
      overdue: 7,
    },
    recentActivity: [
      {
        id: 'preview-1',
        action: 'Atualização de ativo',
        resource: 'Escavadora CAT 320',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'preview-2',
        action: 'Ordem de trabalho criada',
        resource: 'Obra Norte',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'preview-3',
        action: 'Manutenção programada',
        resource: 'Grua Torre 04',
        createdAt: new Date().toISOString(),
      },
    ],
    generatedAt: new Date().toISOString(),
  };

  const assetAvailability =
    overview.assetHealth.total > 0
      ? Math.round((overview.assetHealth.active / overview.assetHealth.total) * 100)
      : 0;

  const operationalEfficiency =
    overview.workOrders.open > 0
      ? Math.max(
          0,
          Math.round(
            ((overview.workOrders.open - overview.workOrders.highPriority) /
              overview.workOrders.open) *
              100,
          ),
        )
      : 100;

  const risks =
    overview.workOrders.highPriority > 0 ? ['Ordens de trabalho de alta prioridade detetadas'] : [];

  const alerts =
    overview.maintenance.overdue > 0
      ? [`${overview.maintenance.overdue} manutenções em atraso`]
      : [];

  const projects = [
    {
      name: 'Sites ativos',
      status: `${overview.sites} sites monitorizados`,
    },
  ];

  const reports = ['Weekly Operations Report', 'Asset Performance Report', 'Risk Analysis Report'];

  const operationsData = [
    { month: 'Jan', value: assetAvailability },
    { month: 'Feb', value: assetAvailability },
    { month: 'Mar', value: assetAvailability },
    { month: 'Apr', value: assetAvailability },
  ];

  return (
    <DashboardShell>
      <section>
        <h2>Astra Command Center</h2>

        <p>Astra COO — operational decision intelligence.</p>

        <KpiGrid overview={overview} />

        <OperationsChart data={operationsData} />

        <RiskPanel risks={risks} />

        <ProjectStatus projects={projects} />

        <AssetHealth assets={overview.assetHealth.total} availability={assetAvailability} />

        <AiPanel assets={overview.assets} risks={overview.workOrders.highPriority} />

        <ExecutiveSummary
          portfolioHealth={assetAvailability}
          operationalEfficiency={operationalEfficiency}
          financialRisk={overview.workOrders.highPriority > 0 ? 'Monitorizar' : 'Low'}
          recommendations={overview.maintenance.overdue}
        />

        <AlertsCenter alerts={alerts} />

        <ReportCenter reports={reports} />

        <ActivityFeed />
      </section>
    </DashboardShell>
  );
}
