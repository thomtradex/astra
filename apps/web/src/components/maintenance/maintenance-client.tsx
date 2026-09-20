'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { type MaintenancePlan } from '@/lib/maintenance-client';
import type { Asset } from '@/lib/assets-client';
import type {
  IntelligenceBriefing,
  IntelligenceSignal,
} from '@/lib/intelligence-client';

import { MaintenanceDecisionAction } from '@/app/intelligence/maintenance-decision-action';

function isOverdue(nextDue: string) {
  return new Date(nextDue).getTime() < Date.now();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function MaintenanceSituationCard({
  signal,
  workOrders,
}: {
  signal: IntelligenceSignal;
  workOrders?: {
    open: number;
    highPriorityOpen: number;
    unassignedHighPriority: number;
  };
}) {
  const context = signal.operationalContext;
  const assetName = context?.asset?.name;
  const siteName = context?.site?.name;
  const maintenanceDue = context?.maintenance?.nextDue;

  const overdueDays =
    maintenanceDue
      ? Math.max(
          0,
          Math.floor(
            (new Date().getTime() - new Date(maintenanceDue).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null;

  const severityLabel =
    signal.severity === 'CRITICAL'
      ? 'Crítico'
      : signal.severity === 'HIGH'
        ? 'Alta prioridade'
        : signal.severity === 'MEDIUM'
          ? 'Prioridade média'
          : 'Baixa prioridade';

  return (
    <article className="p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-950">
              {severityLabel}
            </span>

            {overdueDays !== null ? (
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {overdueDays === 0
                  ? 'Vencida hoje'
                  : `${overdueDays} dia(s) em atraso`}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
            {signal.title}
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {signal.explanation}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Equipamento
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {assetName ?? 'Equipamento não identificado'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Local
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {siteName ?? 'Local não identificado'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Ordens abertas
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {workOrders?.open ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Alta prioridade
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {workOrders?.highPriorityOpen ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Porque importa
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-700">
                {signal.impact}
              </p>
            </div>

            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Ação recomendada
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-6">
                {signal.recommendedAction}
              </p>
            </div>
          </div>

          {signal.chain ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Contexto operacional
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {signal.chain.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {signal.chain.explanation}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {signal.chain.nodes.map((node) => (
                  <span
                    key={`${node.type}-${node.id}`}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {signal.action ? (
          <div className="w-full shrink-0 lg:w-72">
            <MaintenanceDecisionAction
              maintenancePlanId={signal.action.resourceId}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function MaintenanceClient({
  plans: initialPlans,
  assets,
  briefing,
}: {
  plans: MaintenancePlan[];
  assets: Asset[];
  briefing: IntelligenceBriefing | null;
}) {
  const [plans] = useState(initialPlans);

  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  );

  const maintenanceSituations = useMemo(
    () =>
      (briefing?.signals ?? []).filter(
        (signal) => signal.type === 'OVERDUE_MAINTENANCE',
      ),
    [briefing],
  );

  const metrics = useMemo(() => {
    const overdue = plans.filter((plan) => isOverdue(plan.nextDue));

    return {
      total: plans.length,
      overdue: overdue.length,
      active: plans.filter((plan) => plan.status === 'ACTIVE').length,
    };
  }, [plans]);

  const upcomingInterventions = useMemo(() => {
    const referenceDate = new Date();
    const now = referenceDate.setHours(0, 0, 0, 0);
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
    const thirtyDays = now + 30 * 24 * 60 * 60 * 1000;

    return plans
      .filter((plan) => {
        const due = new Date(plan.nextDue).getTime();

        return (
          due >= now &&
          due <= thirtyDays &&
          plan.status.toUpperCase() === 'ACTIVE'
        );
      })
      .sort(
        (a, b) =>
          new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
      )
      .map((plan) => ({
        plan,
        asset: assetsById.get(plan.assetId),
        withinSevenDays:
          new Date(plan.nextDue).getTime() <= sevenDays,
      }));
  }, [assetsById, plans]);

  const upcomingSevenDays = useMemo(
    () => upcomingInterventions.filter((item) => item.withinSevenDays),
    [upcomingInterventions],
  );

  const upcomingThirtyDays = useMemo(
    () => upcomingInterventions.filter((item) => !item.withinSevenDays),
    [upcomingInterventions],
  );

  function formatFrequency(frequency: string) {
    const normalized = frequency.toUpperCase();

    if (normalized === 'MONTHLY') return 'Mensal';
    if (normalized === 'WEEKLY') return 'Semanal';
    if (normalized === 'QUARTERLY') return 'Trimestral';
    if (normalized === 'YEARLY' || normalized === 'ANNUALLY') return 'Anual';

    return frequency;
  }

  return (
    <div className="space-y-6">
      {maintenanceSituations.length > 0 ? (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-6 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Controlo operacional
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  O que precisa de atenção?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Situações de manutenção que a Astra detetou e que podem
                  exigir uma decisão sobre a operação.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Situações abertas
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {maintenanceSituations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {maintenanceSituations.map((signal) => {
              const context = signal.operationalContext;
              const workOrders = context?.workOrders;

              return (
                <MaintenanceSituationCard
                  key={signal.id}
                  signal={signal}
                  workOrders={workOrders}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Planeadas', metrics.total, 'Intervenções registadas'],
          ['Ativas', metrics.active, 'Planos em execução'],
          ['Em atraso', metrics.overdue, 'Intervenções que precisam de atenção'],
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

      {upcomingInterventions.length > 0 ? (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Planeamento operacional
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Próximas intervenções
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Antecipe o que a operação precisa de preparar nos próximos 30 dias.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {upcomingInterventions.length}
                </p>
                <p className="text-xs text-slate-400">
                  intervenção(ões) programada(s)
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    Próximos 7 dias
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Intervenções que podem exigir preparação imediata.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {upcomingSevenDays.length}
                </span>
              </div>

              {upcomingSevenDays.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Sem intervenções nos próximos 7 dias
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Não existem manutenções preventivas ativas previstas para esta janela.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {upcomingSevenDays.map(({ plan, asset }) => (
                    <div
                      key={plan.id}
                      className="grid gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:grid-cols-[120px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {formatDate(plan.nextDue)}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          Próximos 7 dias
                        </p>
                      </div>

                      <div className="min-w-0">
                        {asset ? (
                          <Link
                            href={`/assets/${asset.id}`}
                            className="truncate text-sm font-semibold text-slate-950 hover:underline"
                          >
                            {asset.name}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-slate-700">
                            Ativo não identificado
                          </p>
                        )}

                        {asset?.sites?.name ? (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {asset.sites.name}
                          </p>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {plan.plan}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatFrequency(plan.frequency)}
                        </p>
                      </div>

                      <div>
                        {(() => {
                          const openWorkOrders =
                            asset?.work_orders.filter(
                              (workOrder) =>
                                !['COMPLETED', 'CANCELLED', 'CLOSED'].includes(
                                  workOrder.status.toUpperCase(),
                                ),
                            ) ?? [];

                          const highPriorityWorkOrders =
                            openWorkOrders.filter((workOrder) =>
                              ['CRITICAL', 'URGENT', 'HIGH'].includes(
                                workOrder.priority.toUpperCase(),
                              ),
                            );

                          if (highPriorityWorkOrders.length > 0) {
                            return (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                                  Atenção operacional
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-900">
                                  {highPriorityWorkOrders.length === 1
                                    ? '1 trabalho de alta prioridade aberto'
                                    : `${highPriorityWorkOrders.length} trabalhos de alta prioridade abertos`}
                                </p>
                              </>
                            );
                          }

                          if (openWorkOrders.length > 0) {
                            return (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Coordenação
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-900">
                                  {openWorkOrders.length === 1
                                    ? '1 trabalho aberto associado'
                                    : `${openWorkOrders.length} trabalhos abertos associados`}
                                </p>
                              </>
                            );
                          }

                          return (
                            <>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Operação
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Sem trabalho aberto associado
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        Planeada
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    8–30 dias
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Intervenções para preparar com antecedência.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {upcomingThirtyDays.length}
                </span>
              </div>

              {upcomingThirtyDays.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {upcomingThirtyDays.map(({ plan, asset }) => (
                    <div
                      key={plan.id}
                      className="grid gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:grid-cols-[120px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {formatDate(plan.nextDue)}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          Preparação
                        </p>
                      </div>

                      <div className="min-w-0">
                        {asset ? (
                          <Link
                            href={`/assets/${asset.id}`}
                            className="truncate text-sm font-semibold text-slate-950 hover:underline"
                          >
                            {asset.name}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-slate-700">
                            Ativo não identificado
                          </p>
                        )}

                        {asset?.sites?.name ? (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {asset.sites.name}
                          </p>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {plan.plan}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatFrequency(plan.frequency)}
                        </p>
                      </div>

                      <div>
                        {(() => {
                          const openWorkOrders =
                            asset?.work_orders.filter(
                              (workOrder) =>
                                !['COMPLETED', 'CANCELLED', 'CLOSED'].includes(
                                  workOrder.status.toUpperCase(),
                                ),
                            ) ?? [];

                          const highPriorityWorkOrders =
                            openWorkOrders.filter((workOrder) =>
                              ['CRITICAL', 'URGENT', 'HIGH'].includes(
                                workOrder.priority.toUpperCase(),
                              ),
                            );

                          if (highPriorityWorkOrders.length > 0) {
                            return (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                                  Atenção operacional
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-900">
                                  {highPriorityWorkOrders.length === 1
                                    ? '1 trabalho de alta prioridade aberto'
                                    : `${highPriorityWorkOrders.length} trabalhos de alta prioridade abertos`}
                                </p>
                              </>
                            );
                          }

                          if (openWorkOrders.length > 0) {
                            return (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Coordenação
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-900">
                                  {openWorkOrders.length === 1
                                    ? '1 trabalho aberto associado'
                                    : `${openWorkOrders.length} trabalhos abertos associados`}
                                </p>
                              </>
                            );
                          }

                          return (
                            <>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Operação
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Sem trabalho aberto associado
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                        Planeada
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Não há outras intervenções programadas até 30 dias
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Controlo operacional
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                O que precisa de decisão?
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Exceções de manutenção que podem exigir coordenação, revisão
                ou intervenção da operação.
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {maintenanceSituations.length} situação(ões)
            </span>
          </div>
        </div>

        {maintenanceSituations.length === 0 ? (
          <div className="px-6 py-10">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-5">
              <p className="text-sm font-semibold text-emerald-900">
                Sem situações que exijam decisão agora
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-800/80">
                Não existem manutenções em atraso registadas. As intervenções
                previstas estão dentro do planeamento operacional.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {maintenanceSituations.map((situation) => {
              const asset = situation.operationalContext?.asset
                ? assetsById.get(situation.operationalContext.asset.id)
                : undefined;

              return (
                <div
                  key={situation.id}
                  className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
                        Atenção
                      </span>
                      <span className="text-xs text-slate-400">
                        Manutenção em atraso
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-slate-950">
                      {asset?.name ??
                        situation.operationalContext?.asset?.name ??
                        situation.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {asset?.sites?.name
                        ? `${asset.sites.name} · `
                        : ''}
                      {situation.explanation}
                    </p>

                    {situation.impact && (
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {situation.impact}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {situation.action ? (
                      <MaintenanceDecisionAction
                        maintenancePlanId={situation.action.resourceId}
                      />
                    ) : (
                      <span className="text-sm text-slate-400">
                        Sem ação disponível
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
