import Link from 'next/link';

import { humanizeOperationalText } from '@/components/intelligence/presentation';
import { severityConfig } from '@/components/intelligence/severity-config';
import { SignalAction } from '@/components/intelligence/signal-action';
import type { IntelligenceSignal } from '@/lib/intelligence-client';

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

function getLastActionPresentation(action: NonNullable<IntelligenceSignal['lastAction']>) {
  const actionLabels: Record<string, string> = {
    ASSIGN_WORK_ORDER: 'Responsável atribuído',
    UPDATE_MAINTENANCE: 'Manutenção reagendada',
    SET_PROJECT_STATUS: 'Projeto colocado em pausa',
  };

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
  }[action.status];

  return {
    actionLabel: actionLabels[action.actionType] ?? action.actionType,
    statusLabel: statusConfig.label,
    statusClassName: statusConfig.className,
  };
}

export function SignalCard({
  signal,
  canExecuteActions,
}: {
  signal: IntelligenceSignal;
  canExecuteActions: boolean;
}) {
  const severity = severityConfig[signal.severity];
  const lastActionPresentation = signal.lastAction
    ? getLastActionPresentation(signal.lastAction)
    : undefined;

  const hasExecutableDecision = Boolean(signal.action);
  const hasAdditionalAiInsight =
    Boolean(signal.aiAnalysis) &&
    signal.aiAnalysis?.status === 'GENERATED' &&
    signal.aiAnalysis.provider.toUpperCase() !== 'DETERMINISTIC';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
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
        {humanizeOperationalText(signal.title)}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {humanizeOperationalText(signal.explanation)}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Porque importa
          </p>

          <p className="mt-1.5 text-sm leading-6 text-slate-700">
            {humanizeOperationalText(signal.impact)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {hasExecutableDecision ? 'Decisão necessária' : 'Recomendação Astra'}
          </p>

          <p className="mt-1.5 text-sm font-semibold leading-6">
            {humanizeOperationalText(signal.recommendedAction)}
          </p>
        </div>
      </div>

      {signal.action ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Decidir agora
          </p>

          <div className="mt-3">
            {canExecuteActions ? (
              <SignalAction action={signal.action} />
            ) : (
              <p className="text-xs leading-5 text-slate-500">
                Esta ação requer uma capacidade adicional do seu plano.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {signal.lastAction && lastActionPresentation ? (
        <div
          className={`mt-4 rounded-xl border px-3 py-2 ${lastActionPresentation.statusClassName}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                Última decisão
              </p>

              <span className="text-xs font-semibold">{lastActionPresentation.actionLabel}</span>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {lastActionPresentation.statusLabel}
            </span>
          </div>

          {signal.lastAction.message ? (
            <p className="mt-1 text-xs leading-5">{signal.lastAction.message}</p>
          ) : null}

          <p className="mt-1 text-[10px] opacity-70">
            {new Date(signal.lastAction.timestamp).toLocaleString('pt-PT')}
          </p>
        </div>
      ) : null}

      <details className="mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-slate-700">
          Ver evidência e contexto
        </summary>

        <div className="space-y-4 border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Porque agora
              </p>

              <span className="text-[10px] font-medium text-slate-400">
                {humanizeOperationalText(signal.urgency)}
              </span>
            </div>
          </div>

          {hasAdditionalAiInsight ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Insight adicional
                </span>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Análise Astra
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                {signal.aiAnalysis?.summary}
              </p>

              {signal.aiAnalysis?.rationale ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {signal.aiAnalysis.rationale}
                </p>
              ) : null}
            </div>
          ) : null}

          {signal.evidenceItems?.length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Evidência
              </p>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {signal.evidenceItems.map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {humanizeOperationalText(item.label)}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {humanizeOperationalText(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : signal.evidence.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Evidência
              </p>

              <ul className="mt-2 space-y-1">
                {signal.evidence.map((item) => (
                  <li key={item} className="text-sm leading-5 text-slate-700">
                    {humanizeOperationalText(item)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {signal.operationalContext ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Contexto operacional
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
