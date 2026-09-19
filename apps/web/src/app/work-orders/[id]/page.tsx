import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getWorkOrder } from '@/lib/work-orders-server';

export const dynamic = 'force-dynamic';

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: 'Aberta',
    IN_PROGRESS: 'Em curso',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  };

  return labels[status] ?? status;
}

function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
  };

  return labels[priority] ?? priority;
}

function statusClasses(status: string) {
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

function priorityClasses(priority: string) {
  if (priority === 'HIGH') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100';
  }

  if (priority === 'MEDIUM') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }

  return 'bg-slate-100 text-slate-600';
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Não definida';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function isOpen(status: string) {
  return status === 'OPEN' || status === 'IN_PROGRESS';
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrder = await getWorkOrder(id);

  if (!workOrder) {
    notFound();
  }

  const open = isOpen(workOrder.status);
  const hasPrioritySignal =
    open && (workOrder.priority === 'HIGH' || workOrder.priority === 'MEDIUM');

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/work-orders"
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar às ordens de trabalho
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(workOrder.status)}`}
            >
              {statusLabel(workOrder.status)}
            </span>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(workOrder.priority)}`}
            >
              Prioridade {priorityLabel(workOrder.priority)}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {workOrder.title}
          </h1>

          {workOrder.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {workOrder.description}
            </p>
          ) : null}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Estado
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {statusLabel(workOrder.status)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Estado atual da execução
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Prioridade
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {priorityLabel(workOrder.priority)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Nível definido na ordem
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Responsável
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {workOrder.assigned_to_id
                ? 'Responsável atribuído'
                : 'Sem responsável'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {workOrder.assigned_to_id
                ? 'A ordem tem responsável definido'
                : 'Requer atribuição para execução'}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Última atualização
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatDate(workOrder.updated_at)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Última alteração registada
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Contexto operacional
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              O que esta ordem representa
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Esta ordem concentra uma intervenção operacional e mantém o
              estado, prioridade, responsável e relações existentes na
              plataforma.
            </p>
          </div>

          {open && !workOrder.assigned_to_id ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Falta um responsável
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                A ordem está ativa mas ainda não tem um responsável atribuído.
              </p>
            </div>
          ) : hasPrioritySignal ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Prioridade operacional
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                A prioridade desta ordem merece acompanhamento enquanto
                permanecer ativa.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Sem situação adicional
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Não existe neste momento uma situação determinística adicional
                nesta ordem.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Ligações operacionais
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Relações disponíveis diretamente nesta ordem.
            </p>

            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Equipamento
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-950">
                  {workOrder.asset_id ? (
                    <Link
                      href={`/assets/${workOrder.asset_id}`}
                      className="text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950"
                    >
                      Ver equipamento associado
                    </Link>
                  ) : (
                    'Sem equipamento associado'
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Obra
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-950">
                  {workOrder.project_id ? (
                    <Link
                      href={`/projects/${workOrder.project_id}`}
                      className="text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950"
                    >
                      Ver obra associada
                    </Link>
                  ) : (
                    'Sem obra associada'
                  )}
                </dd>
              </div>
            </dl>
          </article>

        </section>
      </main>
    </DashboardShell>
  );
}
