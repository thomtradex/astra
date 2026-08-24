import { ActivityPanel } from '@/components/demo/activity/activity-panel';
import { IntelligencePanel } from '@/components/demo/intelligence-panel';
import { ProjectMetrics } from '@/components/demo/project-metrics';
import { ProjectStatus } from '@/components/demo/project-status';
import { RiskPanel } from '@/components/demo/risk-panel';
import { KpiGrid } from '@/components/demo/widgets/kpi-grid';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export default function DemoDashboardPage() {
  return (
    <Container>
      <PageHeader
        title="Astra Operations Intelligence"
        description="Centro de comando inteligente para empresas de construção."
      />

      <KpiGrid />

      <ProjectStatus />

      <ProjectMetrics />

      <IntelligencePanel />

      <RiskPanel />

      <ActivityPanel />
    </Container>
  );
}
