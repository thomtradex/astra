import { redirect } from 'next/navigation';

import { ChangeCard } from '@/components/intelligence/change-card';
import { DailyBriefingCard } from '@/components/intelligence/daily-briefing-card';
import { DecisionHistory } from '@/components/intelligence/decision-history';
import { LockedIntelligence } from '@/components/intelligence/locked-intelligence';
import { SignalCard } from '@/components/intelligence/signal-card';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getCurrentEntitlementsServer, getCurrentSubscriptionServer } from '@/lib/billing-server';
import { getIntelligenceBriefing } from '@/lib/intelligence-client';

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
            {(() => {
              const additionalSignals = briefing.signals.slice(briefing.daily.priorities.length);

              if (additionalSignals.length === 0) {
                return null;
              }

              return (
                <>
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Outras situações
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Situações identificadas pela Astra que não estão entre as prioridades do
                        briefing.
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      {additionalSignals.length}{' '}
                      {additionalSignals.length === 1 ? 'situação' : 'situações'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {additionalSignals.map((signal) => (
                      <SignalCard
                        key={signal.id}
                        signal={signal}
                        canExecuteActions={hasCooActions}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </section>
        ) : null}

        <DecisionHistory briefing={briefing} />

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
