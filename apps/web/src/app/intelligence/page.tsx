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

function DecisionChain({ signal }: { signal: IntelligenceSignal }) {
  const chain = signal.chain;

  if (!chain || chain.nodes.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Cadeia operacional
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Astra COO
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-white">{chain.title}</h3>

        <p className="mt-1.5 text-xs leading-5 text-slate-400">{chain.explanation}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch">
        {chain.nodes.map((node, index) => (
          <div
            key={`${node.type}-${node.id}`}
            className="flex min-w-0 flex-1 items-stretch gap-2 md:items-center"
          >
            <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {node.type.replace('_', ' ')}
                </p>
                {node.state && (
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                    {node.state}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-white">{node.label}</p>
            </div>

            {index < chain.nodes.length - 1 && (
              <div className="hidden shrink-0 items-center text-slate-500 md:flex">→</div>
            )}
          </div>
        ))}
      </div>

      {chain.edges.length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Relações
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {chain.edges.map((edge) => (
              <span
                key={`${edge.from.id}-${edge.to.id}-${edge.relationship}`}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200"
              >
                {edge.from.label} → {edge.relationship} → {edge.to.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Impacto
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{chain.impact}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 md:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Próxima ação
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-white">
            {chain.recommendedAction}
          </p>
        </div>
      </div>
    </div>
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
  canExecuteActions,
}: {
  briefing: IntelligenceBriefing['daily'];
  canExecuteActions: boolean;
}) {
  const summary = briefing.summary;
  const topPriority = briefing.priorities[0];
  const remainingPriorities = briefing.priorities.slice(1);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Astra COO
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {briefing.date}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {summary.headline}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {summary.explanation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[360px]">
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-300">
                Críticos
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary.critical}</p>
            </div>

            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-300">
                Alta prioridade
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary.high}</p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Prioridade média
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary.medium}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Sinais abertos
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {topPriority ? (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Decisão prioritária
              </p>
              <p className="text-sm text-slate-500">
                A situação que deve ser revista primeiro.
              </p>
            </div>

            <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${severityConfig[topPriority.severity].className}`}
                    >
                      {severityConfig[topPriority.severity].label}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Em aberto
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                    {topPriority.title}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {topPriority.why}
                  </p>
                </div>

                {topPriority.action ? (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {canExecuteActions ? 'Ação disponível' : 'Professional'}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Impacto
                  </p>
                  <p className="mt-1.5 text-sm leading-5 text-slate-700">
                    {topPriority.impact}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Próxima ação
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-900">
                    {topPriority.recommendedAction}
                  </p>
                </div>
              </div>

              {topPriority.action ? (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  {canExecuteActions ? (
                    <SignalAction action={topPriority.action} />
                  ) : (
                    <Link
                      href="/plans?plan=PROFESSIONAL"
                      className="inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Ver Professional
                    </Link>
                  )}
                </div>
              ) : null}
            </article>

            {remainingPriorities.length > 0 ? (
              <div className="mt-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Outros sinais
                  </p>
                  <p className="text-sm text-slate-500">
                    Situações seguintes por ordem de prioridade.
                  </p>
                </div>

                <div className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                  {remainingPriorities.map((priority) => {
                    const severity = severityConfig[priority.severity];

                    return (
                      <div
                        key={`${priority.rank}-${priority.source.resource}-${priority.source.resourceId ?? 'unknown'}`}
                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${severity.className}`}
                            >
                              {severity.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-slate-400">
                              {priority.source.resource.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {priority.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {priority.recommendedAction}
                          </p>
                        </div>

                        <Link
                          href={getSignalHref({
                            id: `${priority.rank}`,
                            type: 'HIGH_PRIORITY_WORK_ORDER',
                            severity: priority.severity,
                            title: priority.title,
                            explanation: priority.why,
                            evidence: [],
                            urgency: priority.why,
                            impact: priority.impact,
                            recommendedAction: priority.recommendedAction,
                            status: 'OPEN',
                            timestamp: briefing.generatedAt,
                            source: priority.source,
                            action: priority.action,
                          })}
                          className="shrink-0 text-xs font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                          Rever na operação →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Próximo passo
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-6 text-white">
                {briefing.nextStep}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-950">
              A operação está estável.
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-900/70">
              {briefing.nextStep}
            </p>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                {signal.status === 'OPEN' ? 'Em aberto' : signal.status}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
              {signal.title}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{signal.explanation}</p>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:max-w-xs">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Porquê agora?
          </div>
          <div className="mt-1 text-xs font-semibold leading-5 text-slate-700">
            {signal.urgency}
          </div>
        </div>
      </div>

      <DecisionChain signal={signal} />

      {signal.evidence.length > 0 && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Evidência
          </div>

          <ul className="mt-2 space-y-1.5">
            {signal.evidence.map((item) => (
              <li key={item} className="text-sm leading-5 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Porque importa
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-700">{signal.impact}</p>
      </div>

      {signal.action ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Executar decisão
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">{signal.recommendedAction}</p>
            {signal.lastAction ? (
              <p className="mt-2 text-xs text-slate-500">
                Última decisão: {signal.lastAction.status} · {signal.lastAction.actionType}
              </p>
            ) : null}
          </div>
          {canExecuteActions ? (
            <SignalAction action={signal.action} />
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={getSignalHref(signal)}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {signal.type === 'OVERDUE_PROJECT' ? 'Rever obra em atraso →' : 'Rever na operação →'}
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
          Astra COO
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          O Briefing COO está disponível no Professional.
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          O Astra COO analisa os dados operacionais disponíveis e transforma situações que requerem
          atenção em sinais claros, com evidência e próxima ação recomendada.
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
              Astra COO
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Briefing operacional
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
              Não foi possível carregar o briefing operacional.
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
                Astra COO · {planCode}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                O que precisa da sua atenção hoje?
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                O briefing diário transforma os sinais operacionais em prioridades claras,
                explica o impacto e indica a próxima ação recomendada.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-slate-950">
                {briefing.daily.summary.total}
              </div>
              <div className="text-xs text-slate-400">sinais em aberto</div>
            </div>
          </div>
        </header>

        <DailyBriefingCard
          briefing={briefing.daily}
          canExecuteActions={hasCooActions}
        />

        {briefing.signals.length > 0 && (
          <section className="mt-8 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Detalhe dos sinais
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Evidência e contexto operacional por situação identificada.
              </p>
            </div>

            {briefing.signals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                canExecuteActions={hasCooActions}
              />
            ))}
          </section>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Resultados das decisões</h2>
              <p className="mt-1 text-xs text-slate-500">
                O que aconteceu às decisões executáveis do COO.
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-700">{totalDecisions} decisões</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Executadas</p>
              <p className="mt-1 text-xl font-semibold text-emerald-900">
                {decisionMetrics.executed}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs text-amber-700">Negadas</p>
              <p className="mt-1 text-xl font-semibold text-amber-900">{decisionMetrics.denied}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Falhadas</p>
              <p className="mt-1 text-xl font-semibold text-rose-900">{decisionMetrics.failed}</p>
            </div>
          </div>
        </section>

        {briefing.changes.length > 0 && (
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                O que mudou recentemente
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Alterações registadas nas últimas 24 horas que podem exigir atenção operacional.
              </p>
            </div>

            <div className="space-y-3">
              {briefing.changes.map((change) => (
                <ChangeCard key={change.id} change={change} />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 text-xs text-slate-400">
          Briefing atualizado em {new Date(briefing.generatedAt).toLocaleString('pt-PT')}. Os sinais
          são baseados nos dados operacionais atualmente disponíveis na Astra.
        </footer>
      </main>
    </DashboardShell>
  );
}
