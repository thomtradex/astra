import type { IntelligenceBriefing } from '@/lib/intelligence-client';

export function DecisionHistory({ briefing }: { briefing: IntelligenceBriefing }) {
  const decisionMetrics = briefing.decisionMetrics;
  const totalDecisions = decisionMetrics.executed + decisionMetrics.denied + decisionMetrics.failed;

  return (
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
          <p className="mt-1 text-xl font-semibold text-emerald-950">{decisionMetrics.executed}</p>
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
  );
}
