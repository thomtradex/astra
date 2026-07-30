import { DashboardLayout } from '@/components/dashboard/layout';
import { StatCard } from '@/components/dashboard/stat-card';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value="1" />
        <StatCard title="Organizations" value="1" />
        <StatCard title="Roles" value="4" />
        <StatCard title="Permissions" value="16" />
      </div>
    </DashboardLayout>
  );
}