import { DashboardLayout } from '@/components/dashboard/layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { getDashboardSummary } from '@/lib/dashboard';

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={String(summary?.users ?? 0)}
        />

        <StatCard
          title="Sites"
          value={String(summary?.sites ?? 0)}
        />

        <StatCard
          title="Assets"
          value={String(summary?.assets ?? 0)}
        />

        <StatCard
          title="Audit Logs"
          value={String(summary?.auditLogs ?? 0)}
        />
      </div>
    </DashboardLayout>
  );
}
