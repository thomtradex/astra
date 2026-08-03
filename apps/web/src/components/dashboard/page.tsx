import { DashboardLayout } from '@/components/dashboard/layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { getDashboardSummary } from '@/lib/dashboard';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const user = await getSession();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
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
