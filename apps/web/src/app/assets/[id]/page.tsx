import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RescheduleMaintenanceAction } from '@/components/maintenance/reschedule-maintenance-action';
import { getAsset } from '@/lib/assets-client';

type AssetPageProps = {
  params: Promise<{ id: string }>;
};

function isOpenWorkOrder(status: string) {
  return !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(
    status.toUpperCase(),
  );
}

function isOverdue(date: string) {
  return new Date(date).getTime() < Date.now();
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatFrequency(value: string) {
  const normalized = value.toUpperCase();

  if (normalized === 'MONTHLY') return 'Mensal';
  if (normalized === 'WEEKLY') return 'Semanal';
  if (normalized === 'QUARTERLY') return 'Trimestral';
  if (normalized === 'YEARLY' || normalized === 'ANNUALLY') return 'Anual';

  return value;
}

function labelStatus(value: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    MAINTENANCE: 'Em manutenção',
    OPEN: 'Aberto',
    IN_PROGRESS: 'Em curso',
    COMPLETED: 'Concluído',
    CLOSED: 'Fechado',
    CANCELLED: 'Cancelado',
  };

  return labels[value.toUpperCase()] ?? value;
}

function labelPriority(value: string) {
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
    URGENT: 'Urgente',
  };

  return labels[value.toUpperCase()] ?? value;
}

function getPriorityClasses(priority: string) {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
    case 'URGENT':
      return 'bg-red-50 text-red-700 ring-red-200';
    case 'HIGH':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200';
  }
}

function getStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'MAINTENANCE':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'COMPLETED':
    case 'CLOSED':
      return 'bg-slate-100 text-slate-600 ring-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200';
  }
}

export default async function AssetDetailPage({
  params,
}: AssetPageProps) {
  const { id } = await params;
  const asset = await getAsset(id);

  if (!asset) {
    notFound();
  }

  const openWorkOrders = asset.work_orders.filter((workOrder) =>
    isOpenWorkOrder(workOrder.status),
  );

  const completedWorkOrders = asset.work_orders.filter(
    (workOrder) => !isOpenWorkOrder(workOrder.status),
  );

  const overduePlans = asset.maintenance_plans.filter(
    (plan) =>
      plan.status.toUpperCase() === 'ACTIVE' &&
      isOverdue(plan.nextDue),
  );

  const activePlans = asset.maintenance_plans.filter(
    (plan) => plan.status.toUpperCase() === 'ACTIVE',
  );

  const upcomingPlans = [...activePlans]
    .filter((plan) => !isOverdue(plan.nextDue))
    .sort(
      (a, b) =>
        new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
    );

  const nextMaintenance = upcomingPlans[0];

  const hasCriticalWork = openWorkOrders.some((workOrder) =>
    ['CRITICAL', 'URGENT'].includes(workOrder.priority.toUpperCase()),
  );

  const hasHighWork = openWorkOrders.some(
    (workOrder) => workOrder.priority.toUpperCase() === 'HIGH',
  );

  const needsCritical = hasCriticalWork;
  const needsAttention = overduePlans.length > 0 || hasHighWork;
  const needsMonitoring =
    asset.status.toUpperCase() !== 'ACTIVE' || openWorkOrders.length > 0;

  const health = needsCritical
    ? {
        label: 'Crítico',
        description:
          'Existe trabalho crítico ou urgente aberto neste equipamento.',
        classes: 'bg-red-50 text-red-700 ring-red-200',
      }
    : needsAttention
      ? {
          label: 'Atenção',
          description:
            'Existem condições que requerem acompanhamento operacional.',
          classes: 'bg-amber-50 text-amber-700 ring-amber-200',
        }
      : needsMonitoring
        ? {
            label: 'Monitorizar',
            description:
              'O equipamento está fora da operação normal ou tem trabalho aberto.',
            classes: 'bg-slate-50 text-slate-600 ring-slate-200',
          }
        : {
            label: 'Saudável',
            description:
              'Não existem situações operacionais relevantes registadas.',
            classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
          };

  const signal =
    hasCriticalWork
      ? {
          title: 'Trabalho crítico aberto',
          description:
            'Existe pelo menos uma ordem de trabalho com prioridade crítica ou urgente.',
        }
      : overduePlans.length > 0
        ? {
            title: 'Manutenção em atraso',
            description: `${overduePlans.length} plano(s) de manutenção ativos ultrapassaram a data prevista.`,
          }
        : hasHighWork
          ? {
              title: 'Intervenção de prioridade alta',
              description:
                'Existe uma ordem de trabalho de prioridade alta em aberto.',
            }
          : openWorkOrders.length > 0
            ? {
                title: 'Atividade operacional aberta',
                description: `${openWorkOrders.length} ordem(ns) de trabalho permanecem abertas.`,
              }
            : asset.status.toUpperCase() !== 'ACTIVE'
              ? {
                  title: 'Equipamento fora de operação normal',
                  description:
                    'O equipamento não se encontra atualmente em estado ativo.',
                }
              : {
                  title: 'Sem situações relevantes',
                  description:
                    'Não existem ordens abertas nem manutenção ativa em atraso.',
                };

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Equipamentos
        </Link>

        <header className="space-y-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {asset.code}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(asset.status)}`}
                >
                  {labelStatus(asset.status)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${health.classes}`}
                >
                  {health.label}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {asset.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {asset.sites?.name ?? 'Sem local atribuído'}
                {asset.sites?.city ? ` · ${asset.sites.city}` : ''}
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Última atualização
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatDateTime(asset.updated_at)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Trabalho aberto
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {openWorkOrders.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasCriticalWork
                ? 'Inclui prioridade crítica'
                : 'Ordens em aberto'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Manutenção
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {activePlans.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {overduePlans.length > 0
                ? `${overduePlans.length} em atraso`
                : 'Planos ativos'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Próxima manutenção
            </p>
            <p className="mt-3 text-xl font-semibold text-slate-950">
              {nextMaintenance ? formatDate(nextMaintenance.nextDue) : '—'}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {nextMaintenance?.plan ?? 'Sem manutenção agendada'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Localização
            </p>
            <p className="mt-3 truncate text-xl font-semibold text-slate-950">
              {asset.sites?.name ?? 'Não atribuída'}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {asset.sites?.address ?? asset.sites?.city ?? 'Sem endereço'}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Situação operacional
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {signal.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {signal.description}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${health.classes}`}
            >
              {health.label}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Estado atual
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {labelStatus(asset.status)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Ordens abertas
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {openWorkOrders.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Planos em atraso
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {overduePlans.length}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Execução
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Ordens de trabalho
                </h2>
              </div>

              <span className="text-xs font-medium text-slate-400">
                {asset.work_orders.length} registadas
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {openWorkOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Nenhuma ordem de trabalho aberta
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    O equipamento não tem trabalho pendente registado.
                  </p>
                </div>
              ) : (
                openWorkOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/work-orders/${workOrder.id}`}
                          className="font-medium text-slate-900 underline decoration-slate-200 underline-offset-4 hover:decoration-slate-900"
                        >
                          {workOrder.title}
                        </Link>
                        {workOrder.description ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {workOrder.description}
                          </p>
                        ) : null}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getPriorityClasses(workOrder.priority)}`}
                      >
                        {labelPriority(workOrder.priority)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getStatusClasses(workOrder.status)}`}
                      >
                        {labelStatus(workOrder.status)}
                      </span>

                      {workOrder.created_at ? (
                        <span className="text-xs text-slate-400">
                          Aberta em {formatDate(workOrder.created_at)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            {completedWorkOrders.length > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">
                  {completedWorkOrders.length} ordem(ns) concluída(s) ou
                  fechada(s) não mostrada(s) na operação ativa.
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Planeamento
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Manutenção
                </h2>
              </div>

              <span className="text-xs font-medium text-slate-400">
                {asset.maintenance_plans.length} plano(s)
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {asset.maintenance_plans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Sem manutenção planeada
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Não existe um plano de manutenção registado para este
                    equipamento.
                  </p>
                </div>
              ) : (
                asset.maintenance_plans.map((plan) => {
                  const overdue = isOverdue(plan.nextDue);

                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {plan.plan}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatFrequency(plan.frequency)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                            overdue
                              ? 'bg-red-50 text-red-700 ring-red-200'
                              : getStatusClasses(plan.status)
                          }`}
                        >
                          {overdue ? 'Em atraso' : labelStatus(plan.status)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Próxima intervenção
                            </p>
                            <p
                              className={`mt-1 text-base font-semibold ${
                                overdue ? 'text-red-700' : 'text-slate-900'
                              }`}
                            >
                              {formatDate(plan.nextDue)}
                            </p>
                          </div>

                          <RescheduleMaintenanceAction
                            maintenancePlanId={plan.id}
                            currentNextDue={plan.nextDue}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Equipamento
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Informação
            </h2>

            <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-400">
                  Código
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {asset.code}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-slate-400">
                  Número de série
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {asset.serial_number ?? '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-slate-400">
                  Local
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {asset.sites?.name ?? '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-slate-400">
                  Registado em
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(asset.created_at)}
                </dd>
              </div>
            </dl>

            {asset.description ? (
              <div className="mt-7 border-t border-slate-100 pt-5">
                <p className="text-xs font-medium text-slate-400">
                  Descrição
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {asset.description}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Leitura operacional
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              O que requer atenção agora
            </h2>

            <div className="mt-6 space-y-4">
              {overduePlans.length > 0 ? (
                <div className="border-b border-white/10 pb-4">
                  <p className="text-sm font-semibold">
                    {overduePlans.length} manutenção(ões) em atraso
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    Verifique os planos que ultrapassaram a data prevista.
                  </p>
                </div>
              ) : null}

              {openWorkOrders.length > 0 ? (
                <div className="border-b border-white/10 pb-4">
                  <p className="text-sm font-semibold">
                    {openWorkOrders.length} ordem(ns) de trabalho aberta(s)
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    Existem intervenções que ainda não foram encerradas.
                  </p>
                </div>
              ) : null}

              {!overduePlans.length && !openWorkOrders.length ? (
                <div>
                  <p className="text-sm font-semibold">
                    Sem pendências operacionais registadas
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    O estado apresentado é baseado exclusivamente nos dados
                    atualmente registados no sistema.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}
