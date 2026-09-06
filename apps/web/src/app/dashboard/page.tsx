import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ActivityFeed } from '@/components/dashboard/activity/activity-feed';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getCurrentEntitlementsServer, getCurrentSubscriptionServer } from '@/lib/billing-server';
import { getDashboardOverview } from '@/lib/dashboard-client';
import { getIntelligenceBriefing } from '@/lib/intelligence-client';

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

      <div className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-800">{label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
    </Link>
  );
}

function Signal({
  title,
  description,
  href,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  tone: 'attention' | 'neutral' | 'positive';
}) {
  const styles = {
    attention: 'border-amber-200 bg-amber-50 text-amber-950',
    neutral: 'border-slate-200 bg-slate-50 text-slate-900',
    positive: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  };

  return (
    <Link
      href={href}
      className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${styles[tone]}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm">{tone === 'attention' ? '!' : tone === 'positive' ? '✓' : '•'}</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs leading-5 opacity-70">{description}</p>
        </div>
        <span className="ml-auto text-xs opacity-40 transition group-hover:opacity-80">→</span>
      </div>
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
  const percentage =
    limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  const status =
    percentage >= 100
      ? 'Limite atingido'
      : percentage >= 80
        ? 'Próximo do limite'
        : 'Dentro da capacidade';

  return (
    <Link href={href} className="block rounded-xl p-3 transition hover:bg-white/5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">
          {limit !== undefined ? `${used} / ${limit}` : `${used}`}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-white/35">
        <span>{status}</span>
        {limit !== undefined && <span>{percentage}%</span>}
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

  const planCode = entitlements?.plan?.code ?? subscription.planCode ?? 'FREE';
  const planName = entitlements?.plan?.name ?? subscription.plan?.name ?? 'Plano atual';
  const limits = entitlements?.limits ?? {};
  const hasIntelligence = entitlements?.features?.intelligence === true;

  const [overview, intelligence] = await Promise.all([
    getDashboardOverview(),
    hasIntelligence
      ? getIntelligenceBriefing().catch(() => null)
      : Promise.resolve(null),
  ]);

  const dashboardOverview = {
    ...overview,
    intelligence: intelligence ?? undefined,
  };

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
      used: dashboardOverview.workOrders.open,
      limit: limits.workOrdersPerMonth,
      href: '/work-orders',
    },
  ];

  const setupComplete =
    dashboardOverview.sites > 0 &&
    dashboardOverview.customers > 0 &&
    dashboardOverview.assets > 0 &&
    dashboardOverview.workOrders.open > 0;

  const intelligenceSignals = dashboardOverview.intelligence?.signals ?? [];
  const attentionCount = intelligenceSignals.length;
  const hasAttention = attentionCount > 0;

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

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Command Center
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                O centro de controlo da sua operação. Veja o que está a acontecer,
                identifique o que precisa de atenção e passe diretamente à ação.
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
                href="/work-orders"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                + Nova ordem
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                Estado
              </div>
              <div className="mt-2 text-sm font-semibold text-emerald-300">
                {hasAttention ? 'Requer atenção' : 'Operação estável'}
              </div>
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
                {dashboardOverview.generatedAt
                  ? 'Atualizados agora'
                  : 'Dados operacionais'}
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
            <span className="hidden text-xs text-slate-400 sm:block">
              Dados reais da empresa
            </span>
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

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Atenção
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  O que precisa de atenção
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Situações identificadas diretamente nos dados da operação.
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                <div className="text-lg font-semibold text-slate-950">{attentionCount}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  sinais
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {intelligenceSignals.length > 0 ? (
                intelligenceSignals.slice(0, 5).map((signal) => {
                  const tone =
                    signal.severity === 'CRITICAL' || signal.severity === 'HIGH'
                      ? 'attention'
                      : 'neutral';

                  const href =
                    signal.source.resource === 'work_orders'
                      ? '/work-orders'
                      : signal.source.resource === 'maintenance_plans'
                        ? '/maintenance'
                        : signal.source.resource === 'projects' &&
                            signal.source.resourceId
                          ? `/projects/${signal.source.resourceId}`
                          : '/intelligence';

                  return (
                    <Signal
                      key={signal.id}
                      title={signal.title}
                      description={signal.recommendedAction}
                      href={href}
                      tone={tone}
                    />
                  );
                })
              ) : hasIntelligence ? (
                <Signal
                  title="Nenhum sinal prioritário identificado"
                  description="Os dados operacionais disponíveis não apresentam situações que cumpram atualmente os critérios de atenção."
                  href="/intelligence"
                  tone="positive"
                />
              ) : (
                <Signal
                  title="Briefing operacional disponível no Professional"
                  description="Ative o Briefing COO para transformar dados operacionais em prioridades e ações recomendadas."
                  href="/plans?plan=PROFESSIONAL"
                  tone="neutral"
                />
              )}

              {hasIntelligence && intelligenceSignals.length > 5 && (
                <Link
                  href="/intelligence"
                  className="block pt-1 text-center text-xs font-semibold text-slate-600 hover:text-slate-950"
                >
                  Ver os {intelligenceSignals.length} sinais →
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Estado da operação
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Preparação
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Acompanhe os elementos essenciais para ter a operação centralizada.
            </p>

            <div className="mt-6 space-y-2">
              {[
                ['Empresa configurada', true, '/onboarding'],
                ['Primeira obra criada', dashboardOverview.sites > 0, '/projects'],
                ['Primeiro cliente criado', dashboardOverview.customers > 0, '/customers'],
                ['Primeiro ativo registado', dashboardOverview.assets > 0, '/assets'],
                ['Primeira ordem criada', dashboardOverview.workOrders.open > 0, '/work-orders'],
              ].map(([label, complete, href]) => (
                <Link
                  key={String(label)}
                  href={String(href)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <span
                    className={[
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      complete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'border border-slate-200 text-slate-300',
                    ].join(' ')}
                  >
                    {complete ? '✓' : '○'}
                  </span>
                  <span
                    className={[
                      'text-xs',
                      complete
                        ? 'text-slate-500'
                        : 'font-medium text-slate-800',
                    ].join(' ')}
                  >
                    {String(label)}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                {setupComplete ? 'Operação pronta' : 'Continue a configuração'}
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {setupComplete
                  ? 'Os elementos essenciais da operação já estão representados na Astra.'
                  : 'Adicione os primeiros elementos da operação para começar a obter valor do Command Center.'}
              </p>
            </div>
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
              Intelligence
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Transforme dados em decisões
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/55">
              O Astra COO utiliza os dados operacionais disponíveis para
              identificar padrões, riscos e oportunidades.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              {dashboardOverview.sites === 0 &&
              dashboardOverview.assets === 0 &&
              dashboardOverview.workOrders.open === 0 ? (
                <>
                  <div className="text-sm font-semibold">
                    Briefing COO pronto para começar
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Registe atividade operacional para que a Astra possa começar
                    a produzir sinais úteis.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">
                    {hasAttention
                      ? 'Existem sinais para analisar'
                      : 'Operação sem sinais críticos'}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {hasAttention
                      ? 'Abra o Briefing COO para aprofundar os sinais disponíveis.'
                      : 'Continue a alimentar a operação para aumentar a qualidade da análise.'}
                  </p>
                </>
              )}
            </div>

            <Link
              href="/intelligence"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Abrir Briefing COO →
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
