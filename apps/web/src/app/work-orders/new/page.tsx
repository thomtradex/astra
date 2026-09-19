import { DashboardShell } from '@/components/layout/dashboard-shell';
import { WorkOrdersClient } from '@/components/work-orders/work-orders-client';
import { getAssets } from '@/lib/assets-client';
import { getWorkOrders } from '@/lib/work-orders-server';
import { listOrganizationUsers } from '@/lib/users-client';

export const dynamic = 'force-dynamic';

export default async function NewWorkOrderPage() {
  const [workOrders, assetsResult, usersResult] = await Promise.allSettled([
    getWorkOrders(),
    getAssets(),
    listOrganizationUsers(),
  ]);

  const assets =
    assetsResult.status === 'fulfilled' ? assetsResult.value : [];

  const users =
    usersResult.status === 'fulfilled' ? usersResult.value : [];

  const loadErrors = [
    assetsResult.status === 'rejected'
      ? `equipamentos: ${
          assetsResult.reason instanceof Error
            ? assetsResult.reason.message
            : 'erro desconhecido'
        }`
      : null,
    usersResult.status === 'rejected'
      ? `responsáveis: ${
          usersResult.reason instanceof Error
            ? usersResult.reason.message
            : 'erro desconhecido'
        }`
      : null,
  ].filter((value): value is string => Boolean(value));

  if (loadErrors.length > 0) {
    console.error(
      '[work-orders/new] Falha ao carregar dados de criação:',
      loadErrors,
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Operação / Ordens de trabalho
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Nova ordem de trabalho
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Registe trabalho operacional com contexto suficiente para que a
            equipa saiba o que fazer, em que equipamento e quem deve assumir
            a execução.
          </p>
        </div>

        {loadErrors.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">
              Alguns dados operacionais não puderam ser carregados.
            </p>

            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              {loadErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>

            <p className="mt-3 text-xs leading-5 text-amber-700">
              A ordem continua a poder ser criada, mas estes dados devem ser
              corrigidos antes de depender deles no processo operacional.
            </p>
          </div>
        )}

        <WorkOrdersClient
          workOrders={
            workOrders.status === 'fulfilled' ? workOrders.value : []
          }
          assets={assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            code: asset.code,
            status: asset.status,
          }))}
          users={users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          }))}
          initialMode="create"
        />
      </div>
    </DashboardShell>
  );
}
