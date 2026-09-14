'use client';

import { useMemo, useState, useTransition } from 'react';

import {
  updateMaintenancePlan,
  type MaintenancePlan,
} from '@/lib/maintenance-client';

function isOverdue(nextDue: string) {
  return new Date(nextDue).getTime() < Date.now();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function MaintenanceClient({
  plans: initialPlans,
}: {
  plans: MaintenancePlan[];
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const overdue = plans.filter((plan) => isOverdue(plan.nextDue));

    return {
      total: plans.length,
      overdue: overdue.length,
      active: plans.filter((plan) => plan.status === 'ACTIVE').length,
    };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesQuery =
        !normalized ||
        plan.plan.toLowerCase().includes(normalized) ||
        plan.assetId.toLowerCase().includes(normalized);

      const overdue = isOverdue(plan.nextDue);

      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'OVERDUE' && overdue) ||
        (filter === 'ACTIVE' && plan.status === 'ACTIVE');

      return matchesQuery && matchesFilter;
    });
  }, [plans, query, filter]);

  function pushDueDate(plan: MaintenancePlan) {
    const current = new Date(plan.nextDue);
    current.setMonth(current.getMonth() + 1);

    setError(null);

    startTransition(async () => {
      try {
        const updated = await updateMaintenancePlan(plan.id, {
          nextDue: current.toISOString(),
        });

        setPlans((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível atualizar a manutenção.',
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total', metrics.total, 'Planos registados'],
          ['Ativos', metrics.active, 'Planos em execução'],
          ['Em atraso', metrics.overdue, 'Precisam de atenção'],
        ].map(([label, value, description]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar manutenção ou ativo..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
        >
          <option value="ALL">Todos</option>
          <option value="OVERDUE">Em atraso</option>
          <option value="ACTIVE">Ativos</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredPlans.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">
            Nenhum plano encontrado
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Não existem intervenções nesta vista
          </h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Plano
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ativo
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Frequência
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Próxima intervenção
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => {
                  const overdue = isOverdue(plan.nextDue);

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-950">
                          {plan.plan}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {plan.status}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {plan.assetId}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {plan.frequency}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            overdue
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
                          ].join(' ')}
                        >
                          {overdue
                            ? `Em atraso · ${formatDate(plan.nextDue)}`
                            : formatDate(plan.nextDue)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {overdue && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => pushDueDate(plan)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Reagendar +1 mês
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
