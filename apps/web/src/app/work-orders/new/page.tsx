import { DashboardShell } from '@/components/layout/dashboard-shell';
import { WorkOrdersClient } from '@/components/work-orders/work-orders-client';
import { getWorkOrders } from '@/lib/work-orders-server';

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage() {
  const workOrders = await getWorkOrders();

  return (
    <DashboardShell>
      <div className="space-y-8">
        <header>
          <p className="text-sm font-medium text-slate-400">
            Operação / Ordens de trabalho
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Nova ordem
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Registe uma nova ordem de trabalho e coloque-a imediatamente na fila operacional.
          </p>
        </header>

        <WorkOrdersClient
          workOrders={workOrders}
          initialMode="create"
        />
      </div>
    </DashboardShell>
  );
}
