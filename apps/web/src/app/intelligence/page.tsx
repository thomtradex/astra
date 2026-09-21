import Link from 'next/link';
import { redirect } from 'next/navigation';

import { MaintenanceDecisionAction } from './maintenance-decision-action';
import { ProjectDecisionAction } from './project-decision-action';
import { WorkOrderDecisionAction } from './work-order-decision-action';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getCurrentEntitlementsServer, getCurrentSubscriptionServer } from '@/lib/billing-server';
import {
  getIntelligenceBriefing,
  type IntelligenceBriefing,
  type IntelligenceSeverity,
  type IntelligenceChange,
  type IntelligenceSignal,
} from '@/lib/intelligence-client';

const severityConfig: Record<
  IntelligenceSeverity,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  CRITICAL: {
    label: 'Crítico',
    className: 'border-red-200 bg-red-50 text-red-950',
    dotClassName: 'bg-red-500',
  },
  HIGH: {
    label: 'Alta',
    className: 'border-orange-200 bg-orange-50 text-orange-950',
    dotClassName: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Média',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
    dotClassName: 'bg-amber-500',
  },
  LOW: {
    label: 'Baixa',
    className: 'border-slate-200 bg-slate-50 text-slate-900',
    dotClassName: 'bg-slate-400',
  },
};

function getSignalHref(signal: IntelligenceSignal): string {
  switch (signal.source.resource) {
    case 'work_orders':
      return '/work-orders';

    case 'maintenance_plans':
      return '/maintenance';

    case 'projects':
      return signal.source.resourceId ? `/projects/${signal.source.resourceId}` : '/projects';

    default:
      return '/dashboard';
  }
}

function getChangeHref(change: IntelligenceChange): string {
  switch (change.source.resource) {
    case 'projects':
      return `/projects/${change.source.resourceId}`;

    case 'work-orders':
      return '/work-orders';

    case 'maintenance':
    case 'maintenance_plans':
      return '/maintenance';

    default:
      return '/dashboard';
  }
}

function ChangeCard({ change }: { change: IntelligenceChange }) {
  const severity = severityConfig[change.severity];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severity.dotClassName}`} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${severity.className}`}
              >
                {severity.label}
              </span>

              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Mudança recente
              </span>
            </div>

            <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-950">
              {change.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">{change.explanation}</p>
          </div>
        </div>

        <Link
          href={getChangeHref(change)}
          className="shrink-0 text-sm font-semibold text-slate-700 hover:text-slate-950"
        >
          Rever →
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Evidência
          </p>

          <ul className="mt-1.5 space-y-1">
            {change.evidence.map((item) => (
              <li key={item} className="text-xs leading-5 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Impacto
          </p>

          <p className="mt-1.5 text-xs leading-5 text-slate-700">{change.impact}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Astra recomenda
          </p>

          <p className="mt-1.5 text-xs font-medium leading-5 text-slate-900">
            {change.recommendedAction}
          </p>
        </div>
      </div>
    </article>
  );
}

function SignalAction({ action }: { action: IntelligenceSignal['action'] }) {
  if (!action) {
    return null;
  }

  if (action.type === 'ASSIGN_WORK_ORDER' && action.resource === 'work_orders') {
    return <WorkOrderDecisionAction workOrderId={action.resourceId} />;
  }

  if (action.type === 'UPDATE_MAINTENANCE' && action.resource === 'maintenance_plans') {
    return <MaintenanceDecisionAction maintenancePlanId={action.resourceId} />;
  }

  if (action.type === 'SET_PROJECT_STATUS' && action.resource === 'projects') {
    return <ProjectDecisionAction projectId={action.resourceId} />;
  }

  return null;
}

function DailyBriefingCard({
  briefing,
}: {
  briefing: IntelligenceBriefing['daily'];
  canExecuteActions: boolean;
}) {
  const summary = briefing.summary;
  const topPriority = briefing.priorities[0];

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                Resumo da operação
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {briefing.date}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{summary.headline}</h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{summary.explanation}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['Críticos', summary.critical],
              ['Alta prioridade', summary.high],
              ['Prioridade média', summary.medium],
              ['Situações abertas', summary.total],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="min-w-[92px] rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {topPriority ? (
          <>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Atenção agora
              </p>
              <p className="mt-1 text-sm text-slate-500">
                A prioridade que deve ser revista primeiro.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${severityConfig[topPriority.severity].className}`}
                    >
                      {severityConfig[topPriority.severity].label}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                    {topPriority.title}
                  </h3>
                </div>

                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  Situação em aberto
                </span>
              </div>

              {topPriority.operationalContext ? (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Contexto operacional
                  </p>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {topPriority.operationalContext.project ? (
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Obra</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.project.name ?? 'Relacionada'}
                        </p>
                      </div>
                    ) : null}

                    {topPriority.operationalContext.asset ? (
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Equipamento
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.asset.name ?? 'Relacionado'}
                        </p>
                      </div>
                    ) : null}

                    {topPriority.operationalContext.site ? (
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Local</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.site.name ?? 'Relacionado'}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Ordens abertas
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {topPriority.operationalContext.workOrders.open}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {topPriority.operationalContext.workOrders.highPriorityOpen} alta prioridade
                        · {topPriority.operationalContext.workOrders.unassignedHighPriority} sem
                        responsável
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Porque agora
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-700">{topPriority.why}</p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Impacto
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-700">{topPriority.impact}</p>
                </div>

                <div className="rounded-xl bg-slate-900 p-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Próxima ação
                  </p>
                  <p className="mt-1.5 text-xs font-semibold leading-5">
                    {topPriority.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Próximo passo
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-6">{briefing.nextStep}</p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-950">A operação está estável.</p>
            <p className="mt-1 text-sm leading-6 text-emerald-900/70">{briefing.nextStep}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SignalCard({
  signal,
  canExecuteActions,
}: {
  signal: IntelligenceSignal;
  canExecuteActions: boolean;
}) {
  const severity = severityConfig[signal.severity];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${severity.className}`}
            >
              {severity.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {signal.status === 'OPEN' ? 'Em aberto' : signal.status}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
            {signal.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">{signal.explanation}</p>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Porque agora
          </p>
          <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-slate-700">
            {signal.urgency}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Porque importa
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-700">{signal.impact}</p>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Ação recomendada
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-6">{signal.recommendedAction}</p>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-slate-700">
          Ver evidência e contexto
        </summary>

        <div className="space-y-4 border-t border-slate-200 p-4">
          {signal.evidenceItems?.length ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Factos
                </p>{' '}
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {signal.evidenceItems.map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.kind}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : signal.evidence.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Factos
              </p>
              <ul className="mt-2 space-y-1">
                {signal.evidence.map((item) => (
                  <li key={item} className="text-sm leading-5 text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {signal.operationalContext ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Contexto
              </p>

              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {signal.operationalContext.project ? (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Obra</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {signal.operationalContext.project.name ?? 'Relacionada'}
                    </p>
                  </div>
                ) : null}

                {signal.operationalContext.asset ? (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Equipamento
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {signal.operationalContext.asset.name ?? 'Relacionado'}
                    </p>
                  </div>
                ) : null}

                {signal.operationalContext.site ? (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Local</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {signal.operationalContext.site.name ?? 'Relacionado'}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Ordens abertas
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {signal.operationalContext.workOrders.open}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {signal.operationalContext.workOrders.highPriorityOpen} alta prioridade ·{' '}
                    {signal.operationalContext.workOrders.unassignedHighPriority} sem responsável
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </details>

      {signal.action ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {canExecuteActions ? (
            <SignalAction action={signal.action} />
          ) : (
            <p className="text-xs text-slate-500">
              Esta ação requer uma capacidade adicional do seu plano.
            </p>
          )}

          {signal.lastAction ? (
            <p className="mt-2 text-xs text-slate-500">
              Última decisão: {signal.lastAction.status} · {signal.lastAction.actionType}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <Link
          href={getSignalHref(signal)}
          className="text-xs font-semibold text-slate-600 transition hover:text-slate-950"
        >
          Ver na operação →
        </Link>
      </div>
    </article>
  );
}

function LockedIntelligence() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Astra
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          O Resumo da operação está disponível no Professional.
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          O Astra analisa os dados operacionais disponíveis e transforma situações que requerem
          atenção em situações claras, com evidência e próxima ação recomendada.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/plans?plan=PROFESSIONAL"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Conhecer Professional →
          </Link>

          <Link
            href="/billing"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver subscrição
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function IntelligencePage() {
  const [subscription, entitlements] = await Promise.all([
    getCurrentSubscriptionServer(),
    getCurrentEntitlementsServer(),
  ]);

  if (!subscription || ['EXPIRED', 'CANCELED'].includes(subscription.status)) {
    redirect('/plans');
  }

  const planCode = entitlements?.plan?.code ?? subscription.planCode ?? 'FREE';

  const hasIntelligence = entitlements?.features?.intelligence === true;
  const hasCooActions = entitlements?.features?.cooActions === true;

  if (!hasIntelligence) {
    return (
      <DashboardShell>
        <main className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Astra
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Resumo da operação
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Transforme dados operacionais em prioridades claras e ações concretas.
            </p>
          </div>

          <LockedIntelligence />
        </main>
      </DashboardShell>
    );
  }

  let briefing;

  try {
    briefing = await getIntelligenceBriefing();
  } catch {
    return (
      <DashboardShell>
        <main className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-950">
              Não foi possível carregar o resumo da operação.
            </h1>
            <p className="mt-2 text-sm leading-6 text-red-900/70">
              Tente novamente dentro de alguns instantes.
            </p>
          </div>
        </main>
      </DashboardShell>
    );
  }

  const decisionMetrics = briefing.decisionMetrics;
  const totalDecisions = decisionMetrics.executed + decisionMetrics.denied + decisionMetrics.failed;

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
        <header className="border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Astra · {planCode}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                O que precisa da sua atenção hoje?
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Uma visão operacional orientada à decisão: o que exige atenção, porque importa e
                qual é a próxima ação.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-2xl font-semibold text-slate-950">
                  {briefing.daily.summary.total}
                </div>
                <div className="text-xs text-slate-400">situações abertas</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-2xl font-semibold text-slate-950">{totalDecisions}</div>
                <div className="text-xs text-slate-400">decisões registadas</div>
              </div>
            </div>
          </div>
        </header>

        <DailyBriefingCard briefing={briefing.daily} canExecuteActions={hasCooActions} />

        {briefing.signals.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Situações operacionais
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Todas as situações identificadas pela Astra, com contexto, evidência e próxima ação.
              </p>
            </div>

            <div className="space-y-3">
              {briefing.signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} canExecuteActions={hasCooActions} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Histórico de decisões
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">Decisões e resultados</h2>
              <p className="mt-1 text-sm text-slate-500">Registo auditável das decisões.</p>
            </div>

            <span className="text-sm font-semibold text-slate-700">
              {totalDecisions} {totalDecisions === 1 ? 'decisão' : 'decisões'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Executadas
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {decisionMetrics.executed}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Negadas
              </p>
              <p className="mt-1 text-xl font-semibold text-amber-950">{decisionMetrics.denied}</p>
            </div>

            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                Falhadas
              </p>
              <p className="mt-1 text-xl font-semibold text-rose-950">{decisionMetrics.failed}</p>
            </div>
          </div>

          {briefing.decisionHistory.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
              {briefing.decisionHistory.map((entry) => {
                const statusConfig = {
                  EXECUTED: {
                    label: 'Executada',
                    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                  },
                  DENIED: {
                    label: 'Não autorizada',
                    className: 'border-amber-200 bg-amber-50 text-amber-800',
                  },
                  FAILED: {
                    label: 'Falhou',
                    className: 'border-rose-200 bg-rose-50 text-rose-800',
                  },
                }[entry.status];

                const verificationConfig = entry.verification
                  ? {
                      VERIFIED: {
                        label: 'Verificado',
                        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                      },
                      STILL_OPEN: {
                        label: 'Ainda aberto',
                        className: 'border-amber-200 bg-amber-50 text-amber-800',
                      },
                      NOT_VERIFIED: {
                        label: 'Não verificado',
                        className: 'border-slate-200 bg-slate-50 text-slate-700',
                      },
                    }[entry.verification.status]
                  : undefined;

                const actionLabels: Record<string, string> = {
                  ASSIGN_WORK_ORDER: 'Responsável atribuído',
                  UPDATE_MAINTENANCE: 'Manutenção reagendada',
                  SET_PROJECT_STATUS: 'Projeto colocado em pausa',
                };

                const resourceLabels: Record<string, string> = {
                  work_orders: 'Ordem de trabalho',
                  'work-orders': 'Ordem de trabalho',
                  maintenance_plans: 'Plano de manutenção',
                  maintenance: 'Manutenção',
                  projects: 'Projeto',
                };

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>

                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          {actionLabels[entry.actionType] ?? entry.actionType}
                        </span>

                        {verificationConfig ? (
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${verificationConfig.className}`}
                          >
                            {verificationConfig.label}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-900">{entry.message}</p>

                      <p className="mt-1 text-xs text-slate-500">
                        {resourceLabels[entry.resource] ?? entry.resource}
                      </p>

                      {entry.actor ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Decidido por {entry.actor.name ?? entry.actor.email ?? 'Utilizador'}
                        </p>
                      ) : null}

                      {entry.verification && verificationConfig ? (
                        <div
                          className={`mt-3 rounded-lg border px-3 py-2 ${verificationConfig.className}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                              Verificação atual
                            </p>
                            <p className="text-[10px] opacity-70">
                              {new Date(entry.verification.checkedAt).toLocaleString('pt-PT')}
                            </p>
                          </div>

                          <p className="mt-1 text-xs font-semibold">{entry.verification.label}</p>

                          <p className="mt-1 text-xs leading-5 opacity-90">
                            {entry.verification.explanation}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <time className="shrink-0 text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleString('pt-PT')}
                    </time>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
              <p className="text-sm font-semibold text-slate-700">
                Ainda não existem decisões registadas.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Quando uma decisão for revista e executada, negada ou falhar, o resultado aparecerá
                aqui.
              </p>
            </div>
          )}
        </section>

        {briefing.changes.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Atividade recente
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Alterações registadas nas últimas 24 horas.
              </p>
            </div>

            <div className="space-y-3">
              {briefing.changes.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-8 text-xs text-slate-400">
          Resumo da operação atualizado em {new Date(briefing.generatedAt).toLocaleString('pt-PT')}.
          As situações são baseadas nos dados operacionais atualmente disponíveis na Astra.
        </footer>
      </main>
    </DashboardShell>
  );
}
