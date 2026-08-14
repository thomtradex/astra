import { ActivityFeed } from "@/components/dashboard/activity/activity-feed";
import { AssetHealth } from "@/components/dashboard/assets/asset-health";
import { OperationsChart } from "@/components/dashboard/charts/operations-chart";
import { ExecutiveSummary } from "@/components/dashboard/executive/executive-summary";
import { AiPanel } from "@/components/dashboard/intelligence/ai-panel";
import { KpiGrid } from "@/components/dashboard/kpis/kpi-grid";
import { AlertsCenter } from "@/components/dashboard/notifications/alerts-center";
import { ProjectStatus } from "@/components/dashboard/projects/project-status";
import { ReportCenter } from "@/components/dashboard/reports/report-center";
import { RiskPanel } from "@/components/dashboard/risk/risk-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <section>
        <h2>
          Astra Command Center
        </h2>

        <p>
          Enterprise construction intelligence platform.
        </p>

        <KpiGrid />

        <OperationsChart />

        <RiskPanel />

        <ProjectStatus />

        <AssetHealth />

        <AiPanel />

        <ExecutiveSummary />

        <AlertsCenter />

        <ReportCenter />

        <ActivityFeed />
      </section>
    </DashboardShell>
  );
}
