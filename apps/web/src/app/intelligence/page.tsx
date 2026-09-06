import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import {
  getCurrentEntitlementsServer,
  getCurrentSubscriptionServer,
} from '@/lib/billing-server';
import {
  getIntelligenceBriefing,
  type IntelligenceSeverity,
  type IntelligenceSignal,
} from '@/lib/intelligence-client';
import { MaintenanceDecisionAction } from './maintenance-decision-action';
import { WorkOrderDecisionAction } from './work-order-decision-action';

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
      return signal.source.resourceId
        ? `/projects/${signal.source.resourceId}`
        : '/projects';

    default:
      return '/dashboard';
  }
}

function SignalCard({ signal }: { signal: IntelligenceSignal }) {
  const severity = severityConfig[signal.severity];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severity.dotClassName}`}
          />

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

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {signal.explanation}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-xs font-medium text-slate-400">
          {signal.urgency}
        </span>
      </div>

      {signal.evidence.length > 0 && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Evidência
          </div>

          <ul className="mt-2 space-y-1.5">
            {signal.evidence.map((item) => (
              <li
                key={item}
                className="text-sm leading-5 text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Próxima ação recomendada
          </div>

          {signal.type === 'OVERDUE_PROJECT' && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Decisão operacional
            </span>
          )}
        </div>

        <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
          {signal.recommendedAction}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={getSignalHref(signal)}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {signal.type === 'OVERDUE_PROJECT'
            ? 'Rever obra em atraso →'
            : 'Rever na operação →'}
        </Link>

        {signal.type === 'OVERDUE_MAINTENANCE' &&
          signal.action?.type === 'UPDATE_MAINTENANCE' &&
          signal.action.resourceId && (
            <MaintenanceDecisionAction
              maintenancePlanId={signal.action.resourceId}
            />
          )}

        {signal.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' &&
          signal.action?.type === 'ASSIGN_WORK_ORDER' &&
          signal.action.resourceId && (
            <WorkOrderDecisionAction
              workOrderId={signal.action.resourceId}
            />
          )}
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
          O Astra COO analisa os dados operacionais disponíveis e transforma
          situações que requerem atenção em sinais claros, com evidência e
          próxima ação recomendada.
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

  const planCode =
    entitlements?.plan?.code ?? subscription.planCode ?? 'FREE';

  const hasIntelligence =
    entitlements?.features?.intelligence === true;

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
              Transforme dados operacionais em prioridades claras e ações
              concretas.
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

  const criticalCount = briefing.signals.filter(
    (signal) => signal.severity === 'CRITICAL',
  ).length;

  const highCount = briefing.signals.filter(
    (signal) => signal.severity === 'HIGH',
  ).length;

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
                O que precisa da sua atenção?
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                O briefing COO reúne os sinais detetados nos dados da
                sua organização e indica a próxima ação recomendada.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-2xl font-semibold text-slate-950">
                  {briefing.signalCount}
                </div>
                <div className="text-xs text-slate-400">
                  sinais em aberto
                </div>
              </div>

              {criticalCount > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="text-2xl font-semibold text-red-950">
                    {criticalCount}
                  </div>
                  <div className="text-xs text-red-800/60">
                    críticos
                  </div>
                </div>
              )}

              {highCount > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <div className="text-2xl font-semibold text-orange-950">
                    {highCount}
                  </div>
                  <div className="text-xs text-orange-800/60">
                    prioridade alta
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {briefing.signals.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>

              <div>
                <h2 className="text-xl font-semibold text-emerald-950">
                  Nenhum sinal prioritário identificado
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-900/70">
                  Os dados operacionais disponíveis não apresentam situações
                  que cumpram atualmente os critérios de atenção do briefing.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {briefing.signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </section>
        )}

        <footer className="mt-8 text-xs text-slate-400">
          Briefing atualizado em{' '}
          {new Date(briefing.generatedAt).toLocaleString('pt-PT')}
          . Os sinais são baseados nos dados operacionais atualmente
          disponíveis na Astra.
        </footer>
      </main>
    </DashboardShell>
  );
}
