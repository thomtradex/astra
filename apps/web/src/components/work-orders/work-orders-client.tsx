'use client';

import { useMemo, useState, useTransition } from 'react';

import {
  updateWorkOrder,
  type WorkOrder,
} from '@/lib/work-orders-client';

const statuses = [
  { value: 'ALL', label: 'Todas' },
  { value: 'OPEN', label: 'Abertas' },
  { value: 'IN_PROGRESS', label: 'Em curso' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const priorities = [
  { value: 'ALL', label: 'Todas as prioridades' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW', label: 'Baixa' },
];

function statusLabel(status: string) {
  return (
    statuses.find((item) => item.value === status)?.label ?? status
  );
}

function priorityLabel(priority: string) {
  return (
    priorities.find((item) => item.value === priority)?.label ?? priority
  );
}

function priorityClass(priority: string) {
  if (priority === 'HIGH') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100';
  }

  if (priority === 'MEDIUM') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }

  return 'bg-slate-100 text-slate-600';
}

function statusClass(status: string) {
  if (status === 'COMPLETED') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  }

  if (status === 'IN_PROGRESS') {
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
  }

  if (status === 'CANCELLED') {
    return 'bg-slate-100 text-slate-500';
  }

  return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';
}

export function WorkOrdersClient({
  workOrders: initialWorkOrders,
  initialMode = 'list',
}: {
  workOrders: WorkOrder[];
  initialMode?: 'list' | 'create';
}) {
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(initialMode === 'create');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  const metrics = useMemo(() => {
    const open = workOrders.filter((item) => item.status === 'OPEN');
    const high = open.filter((item) => item.priority === 'HIGH');
    const unassigned = open.filter((item) => !item.assigned_to_id);

    return {
      total: workOrders.length,
      open: open.length,
      high: high.length,
      unassigned: unassigned.length,
    };
  }, [workOrders]);

  const filteredWorkOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return workOrders.filter((workOrder) => {
      const matchesStatus =
        status === 'ALL' || workOrder.status === status;

      const matchesPriority =
        priority === 'ALL' || workOrder.priority === priority;

      const matchesQuery =
        !normalized ||
        workOrder.title.toLowerCase().includes(normalized) ||
        workOrder.description?.toLowerCase().includes(normalized);

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }, [workOrders, query, status, priority]);

  function createOrder() {
    const title = newTitle.trim();

    if (!title) {
      setError('Indique um título para a ordem de trabalho.');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const { createWorkOrder } = await import('@/lib/work-orders-client');

        const created = await createWorkOrder({
          title,
          priority: newPriority,
          status: 'OPEN',
        });

        setWorkOrders((current) => [created, ...current]);
        setNewTitle('');
        setNewPriority('MEDIUM');
        setShowCreateForm(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível criar a ordem.',
        );
      }
    });
  }

  function changeStatus(workOrder: WorkOrder, nextStatus: string) {
    setError(null);

    startTransition(async () => {
      try {
        const updated = await updateWorkOrder(workOrder.id, {
          status: nextStatus,
        });

        setWorkOrders((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível atualizar a ordem.',
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowCreateForm((current) => !current);
          }}
          className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          {showCreateForm ? 'Fechar' : 'Nova ordem'}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="new-work-order-title"
                className="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                Título
              </label>
              <input
                id="new-work-order-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Ex.: Reparar bomba hidráulica"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="new-work-order-priority"
                className="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                Prioridade
              </label>
              <select
                id="new-work-order-priority"
                value={newPriority}
                onChange={(event) => setNewPriority(event.target.value)}
                className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Média</option>
                <option value="LOW">Baixa</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={createOrder}
              className="rounded-xl bg-astra-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Criar ordem
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total', metrics.total, 'Todas as ordens registadas'],
          ['Abertas', metrics.open, 'Precisam de acompanhamento'],
          ['Alta prioridade', metrics.high, 'Atenção operacional'],
          ['Sem responsável', metrics.unassigned, 'Risco de execução'],
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
          placeholder="Pesquisar ordens..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
        >
          {priorities.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredWorkOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">
            Nenhuma ordem encontrada
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            A operação está limpa nesta vista
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Altere os filtros ou pesquise outro termo para encontrar trabalho
            operacional.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ordem
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Prioridade
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Responsável
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-950">
                        {workOrder.title}
                      </div>
                      {workOrder.description && (
                        <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {workOrder.description}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(workOrder.status)}`}
                      >
                        {statusLabel(workOrder.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass(workOrder.priority)}`}
                      >
                        {priorityLabel(workOrder.priority)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {workOrder.assigned_to_id ? (
                        <span className="text-slate-700">
                          Responsável atribuído
                        </span>
                      ) : (
                        <span className="font-medium text-red-600">
                          Sem responsável
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={workOrder.status}
                        disabled={isPending}
                        onChange={(event) =>
                          changeStatus(workOrder, event.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none"
                        aria-label={`Alterar estado de ${workOrder.title}`}
                      >
                        {statuses
                          .filter((item) => item.value !== 'ALL')
                          .map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
