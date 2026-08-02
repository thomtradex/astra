import { redirect } from 'next/navigation';

import { DashboardLayout } from '@/components/dashboard/layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value="1" />
        <StatCard title="Organizations" value="1" />
        <StatCard title="Roles" value="4" />
        <StatCard title="Permissions" value="16" />
      </div>
    </DashboardLayout>
  );
}
