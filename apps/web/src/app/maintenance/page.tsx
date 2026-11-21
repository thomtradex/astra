import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MaintenanceClient } from '@/components/maintenance/maintenance-client';
import { getMaintenanceOperationalData } from '@/lib/maintenance-server';

export default async function MaintenancePage() {
  const { plans, assets, briefing } = await getMaintenanceOperationalData();

  return (
    <DashboardShell>
      <div className="space-y-8">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Operação / Manutenção
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Manutenção
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Saiba que equipamentos precisam de atenção, o que está em
              atraso e que intervenções se aproximam.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {plans.length} intervenção(ões) planeada(s)
          </div>
        </header>

        <MaintenanceClient plans={plans} assets={assets} briefing={briefing} />
      </div>
    </DashboardShell>
  );
}
