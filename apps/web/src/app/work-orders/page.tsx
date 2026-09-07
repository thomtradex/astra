import { DashboardShell } from '@/components/layout/dashboard-shell';
import { WorkOrdersClient } from '@/components/work-orders/work-orders-client';
import { getWorkOrders } from '@/lib/work-orders-client';

export default async function WorkOrdersPage() {
  const workOrders = await getWorkOrders();

  return (
    <DashboardShell>
      <div className="space-y-8">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Operação / Ordens de trabalho
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Ordens de trabalho
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Veja o trabalho operacional em aberto, identifique prioridades e
              mantenha cada ordem com um responsável claro.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {workOrders.length} ordem(ns) registada(s)
          </div>
        </header>

        <WorkOrdersClient workOrders={workOrders} />
      </div>
    </DashboardShell>
  );
}
