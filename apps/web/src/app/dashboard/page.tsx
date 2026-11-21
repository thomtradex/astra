import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ActivityFeed } from '@/components/dashboard/activity/activity-feed';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { deriveAstraState } from '@/lib/astra-state';
import { getCurrentEntitlementsServer, getCurrentSubscriptionServer } from '@/lib/billing-server';
import { getDashboardOverview } from '@/lib/dashboard-client';

function StatCard({
  label,
  value,
  detail,
  href,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
          {icon}
        </div>
        <span className="text-slate-300 transition group-hover:text-slate-700">↗</span>
      </div>

      <div className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>

      <div className="mt-1 text-sm font-medium text-slate-800">{label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
    </Link>
  );
}

function CapacityBar({
  label,
  used,
  limit,
  href,
}: {
  label: string;
  used: number;
  limit?: number;
  href: string;
}) {
  const hasFiniteLimit = limit !== undefined && Number.isFinite(limit) && limit > 0;
  const percentage = hasFiniteLimit ? Math.min(100, Math.round((used / limit) * 100)) : null;

  const status =
    percentage === null
      ? 'Sem limite definido'
      : percentage >= 100
        ? 'Limite atingido'
        : percentage >= 80
          ? 'Próximo do limite'
          : 'Dentro da capacidade';

  return (
    <Link href={href} className="block rounded-xl p-3 transition hover:bg-white/5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">
          {limit === undefined
            ? `${used}`
            : Number.isFinite(limit)
              ? `${used} / ${limit}`
              : `${used} / ∞`}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        {percentage !== null && (
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-white/35">
        <span>{status}</span>
        {percentage !== null && <span>{percentage}%</span>}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [subscription, entitlements] = await Promise.all([
    getCurrentSubscriptionServer(),
    getCurrentEntitlementsServer(),
  ]);

  if (!subscription || ['EXPIRED', 'CANCELED'].includes(subscription.status)) {
    redirect('/plans');
  }
  const planName = entitlements?.plan?.name ?? subscription.plan?.name ?? 'Plano atual';
  const limits = entitlements?.limits ?? {};
  const dashboardOverview = await getDashboardOverview();

  const operationalItems = [
    {
      label: 'Sites',
      used: dashboardOverview.sites,
      limit: limits.sites,
      href: '/projects',
    },
    {
      label: 'Clientes',
      used: dashboardOverview.customers,
      limit: limits.customers,
      href: '/customers',
    },
    {
      label: 'Ativos',
      used: dashboardOverview.assets,
      limit: limits.assets,
      href: '/assets',
    },
    {
      label: 'Ordens este mês',
      used: dashboardOverview.workOrders.thisMonth,
      limit: limits.workOrdersPerMonth,
      href: '/work-orders',
    },
  ];

  const astraState = deriveAstraState({
    briefing: dashboardOverview.intelligence,
    sites: dashboardOverview.sites,
    customers: dashboardOverview.customers,
    assets: dashboardOverview.assets,
    openWorkOrders: dashboardOverview.workOrders.open,
  });

  return (
    <DashboardShell>
      <div className="space-y-7">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Operação ativa
              </div>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Command Center</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                O centro de controlo da sua operação. Veja o que está a acontecer, identifique o que
                precisa de atenção e passe diretamente à ação.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/projects"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                + Nova obra
              </Link>
              <Link
                href="/work-orders/new"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                + Nova ordem
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                Estado da Astra
              </div>
              <div className="mt-2 text-sm font-semibold text-emerald-300">{astraState.label}</div>
              <p className="mt-1 text-xs leading-5 text-white/45">{astraState.summary}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                Plano
              </div>
              <div className="mt-2 text-sm font-semibold">{planName}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                Dados
              </div>
              <div className="mt-2 text-sm font-semibold">
                {dashboardOverview.generatedAt ? 'Atualizados agora' : 'Dados operacionais'}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Porque este é o estado da Astra
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {astraState.summary}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{astraState.reason}</p>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                <div className="text-lg font-semibold text-slate-950">
                  {astraState.criticalCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  críticos
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                <div className="text-lg font-semibold text-slate-950">{astraState.highCount}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  alta prioridade
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                <div className="text-lg font-semibold text-slate-950">{astraState.mediumCount}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  monitorização
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Visão operacional
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                A sua operação agora
              </h2>
            </div>
            <span className="hidden text-xs text-slate-400 sm:block">Dados reais da empresa</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Clientes"
              value={dashboardOverview.customers}
              detail="Clientes registados"
              href="/customers"
              icon="◉"
            />

            <StatCard
              label="Sites / obras"
              value={dashboardOverview.sites}
              detail="Locais da operação"
              href="/projects"
              icon="⌂"
            />

            <StatCard
              label="Ativos"
              value={dashboardOverview.assets}
              detail={`${dashboardOverview.assetHealth.active} atualmente ativos`}
              href="/assets"
              icon="⚙"
            />

            <StatCard
              label="Ordens abertas"
              value={dashboardOverview.workOrders.open}
              detail={
                dashboardOverview.workOrders.highPriority > 0
                  ? `${dashboardOverview.workOrders.highPriority} de alta prioridade`
                  : 'Nenhuma prioridade alta'
              }
              href="/work-orders"
              icon="✓"
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Capacidade
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Espaço disponível no {planName}
                </h2>
              </div>

              <Link
                href="/billing"
                className="text-xs font-semibold text-slate-700 hover:underline"
              >
                Gerir plano →
              </Link>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {operationalItems.map((item) => (
                <CapacityBar key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
              Inteligência Astra
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Transforme dados em decisões
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/55">
              A Astra utiliza os dados operacionais disponíveis para identificar situações
              relevantes e riscos operacionais.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              {astraState.state === 'STARTING' ? (
                <>
                  <div className="text-sm font-semibold">
                    Resumo da operação pronto para começar
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Registe atividade operacional para que a Astra possa começar a produzir
                    situações úteis.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">
                    {astraState.signalCount > 0
                      ? 'Existem situações para analisar'
                      : 'Operação sem situações prioritárias'}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {astraState.signalCount > 0
                      ? 'Abra o Resumo da operação para aprofundar as situações disponíveis.'
                      : 'A Astra não identificou atualmente situações que exijam intervenção prioritária.'}
                  </p>
                </>
              )}
            </div>

            <Link
              href="/intelligence"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Abrir Resumo da operação →
            </Link>
          </div>
        </section>

        <ActivityFeed activities={dashboardOverview.recentActivity ?? []} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Acesso rápido
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Trabalhe diretamente na operação
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Entre diretamente nas áreas onde a sua equipa trabalha todos os dias.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { href: '/projects', label: 'Obras' },
                { href: '/customers', label: 'Clientes' },
                { href: '/assets', label: 'Ativos' },
                { href: '/work-orders', label: 'Ordens' },
                { href: '/maintenance', label: 'Manutenção' },
                { href: '/billing', label: 'Subscrição' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
