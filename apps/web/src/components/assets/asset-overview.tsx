'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { Asset } from '@/lib/assets-client';

type Health = 'CRITICAL' | 'ATTENTION' | 'MONITOR' | 'HEALTHY';

type FilterHealth = 'ALL' | Health;

function isOpenWorkOrder(status: string): boolean {
  return !['COMPLETED', 'CANCELLED', 'CLOSED'].includes(status.toUpperCase());
}

function isOverdue(date: string): boolean {
  return new Date(date).getTime() < Date.now();
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

function getDaysUntil(date: string): number {
  const target = new Date(date);
  const today = new Date();

  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getHealth(asset: Asset): Health {
  const openWorkOrders = asset.work_orders.filter((workOrder) =>
    isOpenWorkOrder(workOrder.status),
  );

  const overdueMaintenance = asset.maintenance_plans.some(
    (plan) => plan.status.toUpperCase() === 'ACTIVE' && isOverdue(plan.nextDue),
  );

  const hasCriticalWork = openWorkOrders.some((workOrder) =>
    ['CRITICAL', 'URGENT'].includes(workOrder.priority.toUpperCase()),
  );

  const hasHighWork = openWorkOrders.some(
    (workOrder) => workOrder.priority.toUpperCase() === 'HIGH',
  );

  if (hasCriticalWork) {
    return 'CRITICAL';
  }

  if (overdueMaintenance || hasHighWork) {
    return 'ATTENTION';
  }

  if (asset.status.toUpperCase() !== 'ACTIVE') {
    return 'MONITOR';
  }

  if (openWorkOrders.length > 0) {
    return 'MONITOR';
  }

  return 'HEALTHY';
}

function getHealthLabel(health: Health): string {
  switch (health) {
    case 'CRITICAL':
      return 'Crítico';
    case 'ATTENTION':
      return 'Atenção';
    case 'MONITOR':
      return 'Monitorizar';
    case 'HEALTHY':
      return 'Saudável';
  }
}

function getHealthClasses(health: Health): string {
  switch (health) {
    case 'CRITICAL':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'ATTENTION':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'MONITOR':
      return 'border-slate-200 bg-slate-50 text-slate-600';
    case 'HEALTHY':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

function getHealthDot(health: Health): string {
  switch (health) {
    case 'CRITICAL':
      return 'bg-red-500';
    case 'ATTENTION':
      return 'bg-amber-500';
    case 'MONITOR':
      return 'bg-slate-400';
    case 'HEALTHY':
      return 'bg-emerald-500';
  }
}

function getStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Ativo';
    case 'MAINTENANCE':
      return 'Em manutenção';
    case 'INACTIVE':
      return 'Inativo';
    case 'RETIRED':
      return 'Retirado';
    default:
      return status;
  }
}

function getStatusClasses(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'MAINTENANCE':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'INACTIVE':
    case 'RETIRED':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function getSignal(asset: Asset): {
  label: string;
  detail: string;
  tone: 'neutral' | 'attention' | 'critical' | 'positive';
} {
  const openWorkOrders = asset.work_orders.filter((workOrder) =>
    isOpenWorkOrder(workOrder.status),
  );

  const overduePlans = asset.maintenance_plans.filter(
    (plan) => plan.status.toUpperCase() === 'ACTIVE' && isOverdue(plan.nextDue),
  );

  const criticalWork = openWorkOrders.find((workOrder) =>
    ['CRITICAL', 'URGENT'].includes(workOrder.priority.toUpperCase()),
  );

  if (criticalWork) {
    return {
      label: 'Intervenção prioritária',
      detail: criticalWork.title,
      tone: 'critical',
    };
  }

  if (overduePlans.length > 0) {
    return {
      label: 'Manutenção em atraso',
      detail: overduePlans[0]!.plan,
      tone: 'attention',
    };
  }

  const highWork = openWorkOrders.find(
    (workOrder) => workOrder.priority.toUpperCase() === 'HIGH',
  );

  if (highWork) {
    return {
      label: 'Trabalho prioritário',
      detail: highWork.title,
      tone: 'attention',
    };
  }

  if (openWorkOrders.length > 0) {
    return {
      label: 'Trabalho aberto',
      detail: `${openWorkOrders.length} ordem${
        openWorkOrders.length === 1 ? '' : 'ens'
      } em curso`,
      tone: 'neutral',
    };
  }

  if (asset.status.toUpperCase() === 'MAINTENANCE') {
    return {
      label: 'Em manutenção',
      detail: 'Equipamento fora de operação normal',
      tone: 'attention',
    };
  }

  const activePlans = asset.maintenance_plans.filter(
    (plan) => plan.status.toUpperCase() === 'ACTIVE',
  );

  if (activePlans.length > 0) {
    const next = [...activePlans].sort(
      (a, b) =>
        new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
    )[0];

    const days = getDaysUntil(next!.nextDue);

    if (days >= 0 && days <= 7) {
      return {
        label: 'Manutenção próxima',
        detail:
          days === 0
            ? 'Prevista para hoje'
            : `Prevista em ${days} dia${days === 1 ? '' : 's'}`,
        tone: 'neutral',
      };
    }
  }

  return {
    label: 'Operação estável',
    detail: 'Sem situações operacionais relevantes',
    tone: 'positive',
  };
}

function getNextMaintenance(asset: Asset): string | null {
  const activePlans = asset.maintenance_plans
    .filter((plan) => plan.status.toUpperCase() === 'ACTIVE')
    .sort(
      (a, b) =>
        new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
    );

  return activePlans[0]?.nextDue ?? null;
}

function getAttentionReason(asset: Asset): string {
  const openWorkOrders = asset.work_orders.filter((workOrder) =>
    isOpenWorkOrder(workOrder.status),
  );

  const criticalWork = openWorkOrders.find((workOrder) =>
    ['CRITICAL', 'URGENT'].includes(workOrder.priority.toUpperCase()),
  );

  if (criticalWork) {
    return `Ordem prioritária: ${criticalWork.title}`;
  }

  const overduePlan = asset.maintenance_plans.find(
    (plan) => plan.status.toUpperCase() === 'ACTIVE' && isOverdue(plan.nextDue),
  );

  if (overduePlan) {
    return `Manutenção em atraso: ${overduePlan.plan}`;
  }

  const highWork = openWorkOrders.find(
    (workOrder) => workOrder.priority.toUpperCase() === 'HIGH',
  );

  if (highWork) {
    return `Prioridade alta: ${highWork.title}`;
  }

  return 'Requer acompanhamento operacional';
}

export function AssetOverview({ assets }: { assets: Asset[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState<FilterHealth>('ALL');

  const metrics = useMemo(() => {
    const operational = assets.filter(
      (asset) => asset.status.toUpperCase() === 'ACTIVE',
    ).length;

    const maintenance = assets.filter(
      (asset) => asset.status.toUpperCase() === 'MAINTENANCE',
    ).length;

    const openWork = assets.reduce(
      (total, asset) =>
        total +
        asset.work_orders.filter((workOrder) =>
          isOpenWorkOrder(workOrder.status),
        ).length,
      0,
    );

    const overdueMaintenance = assets.reduce(
      (total, asset) =>
        total +
        asset.maintenance_plans.filter(
          (plan) =>
            plan.status.toUpperCase() === 'ACTIVE' &&
            isOverdue(plan.nextDue),
        ).length,
      0,
    );

    const health = assets.map((asset) => getHealth(asset));

    return {
      total: assets.length,
      operational,
      maintenance,
      openWork,
      overdueMaintenance,
      critical: health.filter((item) => item === 'CRITICAL').length,
      attention: health.filter((item) => item === 'ATTENTION').length,
      monitor: health.filter((item) => item === 'MONITOR').length,
      healthy: health.filter((item) => item === 'HEALTHY').length,
    };
  }, [assets]);

  const attentionAssets = useMemo(
    () =>
      assets.filter((asset) =>
        ['CRITICAL', 'ATTENTION'].includes(getHealth(asset)),
      ),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.code.toLowerCase().includes(normalizedSearch) ||
        asset.serial_number?.toLowerCase().includes(normalizedSearch) ||
        asset.sites?.name.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'ALL' ||
        asset.status.toUpperCase() === statusFilter;

      const matchesHealth =
        healthFilter === 'ALL' || getHealth(asset) === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [assets, healthFilter, search, statusFilter]);

  const maintenanceHorizon = useMemo(() => {
    const grouped = new Map<string, number>();

    assets.forEach((asset) => {
      const nextMaintenance = getNextMaintenance(asset);

      if (!nextMaintenance || isOverdue(nextMaintenance)) {
        return;
      }

      const key = new Date(nextMaintenance).toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 4)
      .map(([date, count]) => ({
        date,
        count,
      }));
  }, [assets]);

  const pulseMessage =
    attentionAssets.length === 0
      ? metrics.maintenance > 0
        ? 'A frota está estável. Existe equipamento em manutenção, mas não há situações críticos ou manutenção em atraso.'
        : 'A frota está estável. Não existem situações críticos, trabalho prioritário ou manutenção em atraso.'
      : `${attentionAssets.length} equipamento${
          attentionAssets.length === 1 ? '' : 's'
        } requer${
          attentionAssets.length === 1 ? '' : 'em'
        } atenção com base nos dados operacionais atuais.`;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_45%)] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Centro operacional
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                Saiba o que requer atenção.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Uma leitura operacional da sua frota, manutenção e trabalho
                aberto — sem métricas inventadas e sem ruído.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Dados operacionais atuais
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Frota
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {metrics.operational}
              <span className="ml-1 text-base font-medium text-slate-400">
                / {metrics.total}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">equipamentos ativos</p>
          </div>

          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Estado
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {metrics.healthy}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              sem situações operacionais relevantes
            </p>
          </div>

          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Em manutenção
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {metrics.maintenance}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              fora da operação normal
            </p>
          </div>

          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Atenção
            </p>
            <p
              className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${
                metrics.critical + metrics.attention > 0
                  ? 'text-amber-600'
                  : 'text-slate-950'
              }`}
            >
              {metrics.critical + metrics.attention}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              equipamentos com situações prioritários
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.14)] sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Operational pulse
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em]">
                {attentionAssets.length === 0
                  ? 'Operação estável'
                  : `${attentionAssets.length} equipamento${
                      attentionAssets.length === 1 ? '' : 's'
                    } requer${
                      attentionAssets.length === 1 ? '' : 'em'
                    } atenção`}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {pulseMessage}
              </p>
            </div>

            <div
              className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                attentionAssets.length === 0
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : 'bg-amber-400/10 text-amber-300'
              }`}
            >
              {attentionAssets.length === 0 ? '✓' : '!'}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{metrics.operational}</p>
              <p className="mt-1 text-[11px] text-slate-400">Ativos</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{metrics.maintenance}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Em manutenção
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{metrics.openWork}</p>
              <p className="mt-1 text-[11px] text-slate-400">Trabalho aberto</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{metrics.overdueMaintenance}</p>
              <p className="mt-1 text-[11px] text-slate-400">Manutenções em atraso</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Maintenance horizon
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Calendário de manutenção
          </h3>

          {maintenanceHorizon.length > 0 ? (
            <div className="mt-6 space-y-3">
              {maintenanceHorizon.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatShortDate(item.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Intervenção programada
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {item.count} equipamento{item.count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500">
              Não existem manutenções futuras registadas para a frota.
            </div>
          )}
        </div>
      </section>

      {attentionAssets.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Requer atenção
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
                Intervenções que merecem ser revistas
              </h3>
            </div>

            <span className="hidden text-xs text-slate-400 sm:block">
              Baseado apenas em dados operacionais registados
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {attentionAssets.map((asset) => {
              const health = getHealth(asset);

              return (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${getHealthDot(
                            health,
                          )}`}
                        />
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getHealthClasses(
                            health,
                          )}`}
                        >
                          {getHealthLabel(health)}
                        </span>
                      </div>

                      <h4 className="mt-4 truncate text-base font-semibold text-slate-950">
                        {asset.name}
                      </h4>

                      <p className="mt-1 text-xs text-slate-400">
                        {asset.code}
                        {asset.sites?.name ? ` · ${asset.sites.name}` : ''}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-medium text-slate-400 transition group-hover:text-slate-700">
                      Abrir →
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-600">
                    {getAttentionReason(asset)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Equipment portfolio
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.025em] text-slate-950">
                Equipamentos
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Pesquise, filtre e reveja o contexto operacional de cada
                equipamento.
              </p>
            </div>

            <p className="text-xs text-slate-400">
              {filteredAssets.length} de {assets.length} equipamentos
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row">
          <div className="min-w-0 flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar equipamento, código, série ou local..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">Estado: todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="MAINTENANCE">Em manutenção</option>
            <option value="INACTIVE">Inativos</option>
            <option value="RETIRED">Retirados</option>
          </select>

          <select
            value={healthFilter}
            onChange={(event) =>
              setHealthFilter(event.target.value as FilterHealth)
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">Saúde: todas</option>
            <option value="CRITICAL">Crítico</option>
            <option value="ATTENTION">Atenção</option>
            <option value="MONITOR">Monitorizar</option>
            <option value="HEALTHY">Saudável</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Equipamento
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Local
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Estado
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Saúde
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Trabalho
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Manutenção
                  </th>
                  <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Situação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const health = getHealth(asset);
                  const openWorkOrders = asset.work_orders.filter((workOrder) =>
                    isOpenWorkOrder(workOrder.status),
                  );
                  const nextMaintenance = getNextMaintenance(asset);
                  const signal = getSignal(asset);

                  return (
                    <tr
                      key={asset.id}
                      className="group transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-5">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="block min-w-[220px]"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-slate-950">
                            {asset.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {asset.code}
                            {asset.serial_number
                              ? ` · SN ${asset.serial_number}`
                              : ''}
                          </p>
                        </Link>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {asset.sites?.name ?? 'Sem local atribuído'}
                        </p>
                        {asset.sites?.city && (
                          <p className="mt-1 text-xs text-slate-400">
                            {asset.sites.city}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClasses(
                            asset.status,
                          )}`}
                        >
                          {getStatusLabel(asset.status)}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getHealthClasses(
                            health,
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getHealthDot(
                              health,
                            )}`}
                          />
                          {getHealthLabel(health)}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-sm font-semibold text-slate-800">
                          {openWorkOrders.length}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {openWorkOrders.length === 0
                            ? 'Nenhum aberto'
                            : openWorkOrders.length === 1
                              ? 'ordem aberta'
                              : 'ordens abertas'}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        {nextMaintenance ? (
                          <>
                            <p
                              className={`text-sm font-semibold ${
                                isOverdue(nextMaintenance)
                                  ? 'text-red-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {formatDate(nextMaintenance)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {isOverdue(nextMaintenance)
                                ? 'Em atraso'
                                : 'Programada'}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Sem plano ativo
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/assets/${asset.id}`}
                          className={`inline-flex max-w-[190px] flex-col items-end ${
                            signal.tone === 'critical'
                              ? 'text-red-700'
                              : signal.tone === 'attention'
                                ? 'text-amber-700'
                                : signal.tone === 'positive'
                                  ? 'text-emerald-700'
                                  : 'text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-semibold">
                            {signal.label}
                          </span>
                          <span className="mt-1 truncate text-[11px] text-slate-400">
                            {signal.detail}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {filteredAssets.map((asset) => {
              const health = getHealth(asset);
              const openWorkOrders = asset.work_orders.filter((workOrder) =>
                isOpenWorkOrder(workOrder.status),
              );
              const nextMaintenance = getNextMaintenance(asset);
              const signal = getSignal(asset);

              return (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="block p-5 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {asset.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {asset.code}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getHealthClasses(
                        health,
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getHealthDot(
                          health,
                        )}`}
                      />
                      {getHealthLabel(health)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Local</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {asset.sites?.name ?? 'Sem local'}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Estado</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {getStatusLabel(asset.status)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Trabalho aberto</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {openWorkOrders.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Manutenção</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {nextMaintenance
                          ? formatShortDate(nextMaintenance)
                          : 'Sem plano'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-700">
                      {signal.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {signal.detail}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredAssets.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum equipamento encontrado
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ajuste a pesquisa ou os filtros para continuar.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
