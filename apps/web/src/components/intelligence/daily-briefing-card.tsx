import { humanizeOperationalText } from '@/components/intelligence/presentation';
import { severityConfig } from '@/components/intelligence/severity-config';
import { SignalAction } from '@/components/intelligence/signal-action';
import type { IntelligenceBriefing } from '@/lib/intelligence-client';

export function DailyBriefingCard({
  briefing,
  canExecuteActions,
}: {
  briefing: IntelligenceBriefing['daily'];
  canExecuteActions: boolean;
}) {
  const summary = briefing.summary;
  const topPriority = briefing.priorities[0];
  const hasAdditionalAiInsight =
    topPriority?.aiAnalysis?.status === 'GENERATED' &&
    topPriority.aiAnalysis.provider.toUpperCase() !== 'DETERMINISTIC';

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-800 bg-slate-950 px-6 py-7 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Briefing operacional
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              O que exige atenção agora
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A Astra reduz a operação às situações que justificam atenção e decisão.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              ['Críticas', summary.critical],
              ['Alta', summary.high],
              ['Média', summary.medium],
              ['Abertas', summary.total],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="min-w-[82px] rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {topPriority ? (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${severityConfig[topPriority.severity].className}`}
                  >
                    {severityConfig[topPriority.severity].label}
                  </span>

                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Atenção agora
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                  {humanizeOperationalText(topPriority.title)}
                </h3>
              </div>

              <div className="max-w-sm rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Porque agora
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">
                  {humanizeOperationalText(topPriority.why)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Porque importa
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">
                  {humanizeOperationalText(topPriority.impact)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Decisão necessária
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-6">
                  {humanizeOperationalText(topPriority.recommendedAction)}
                </p>
              </div>
            </div>

            {hasAdditionalAiInsight ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Insight adicional
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Análise Astra
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                  {topPriority.aiAnalysis?.summary}
                </p>

                {topPriority.aiAnalysis?.rationale ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {topPriority.aiAnalysis.rationale}
                  </p>
                ) : null}
              </div>
            ) : null}

            {topPriority.operationalContext ? (
              <details className="mt-4 rounded-xl border border-slate-200 bg-white">
                <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-slate-700">
                  Ver contexto operacional
                </summary>

                <div className="border-t border-slate-200 p-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {topPriority.operationalContext.project ? (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Obra</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.project.name ?? 'Relacionada'}
                        </p>
                      </div>
                    ) : null}

                    {topPriority.operationalContext.asset ? (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Equipamento
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.asset.name ?? 'Relacionado'}
                        </p>
                      </div>
                    ) : null}

                    {topPriority.operationalContext.site ? (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Local</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {topPriority.operationalContext.site.name ?? 'Relacionado'}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Ordens abertas
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {topPriority.operationalContext.workOrders.open}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {topPriority.operationalContext.workOrders.highPriorityOpen} alta prioridade
                        {' · '}
                        {topPriority.operationalContext.workOrders.unassignedHighPriority} sem
                        responsável
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            ) : null}

            {topPriority.action ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Decidir agora
                </p>

                <div className="mt-3">
                  {canExecuteActions ? (
                    <SignalAction action={topPriority.action} />
                  ) : (
                    <p className="text-xs text-slate-500">
                      Esta ação requer uma capacidade adicional do seu plano.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-950">
              Não há situações que exijam atenção imediata.
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-900/70">
              A Astra continua a acompanhar a operação com base nos dados disponíveis.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
