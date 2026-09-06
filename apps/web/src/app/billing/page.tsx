'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  changePlan,
  getBillingPlans,
  getCurrentSubscription,
  type BillingPlan,
} from '@/lib/billing-client';

type Subscription = {
  id: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  plan: BillingPlan;
};

function formatPrice(plan: BillingPlan) {
  if (plan.monthlyPriceCents === 0) {
    return '€0/mês';
  }

  if (plan.code === 'ENTERPRISE') {
    return 'Desde €599/mês';
  }

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: plan.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(plan.monthlyPriceCents / 100) + '/mês';
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function statusLabel(subscription: Subscription) {
  if (subscription.cancelAtPeriodEnd) {
    return 'Cancelamento agendado';
  }

  if (subscription.status === 'TRIALING') {
    return 'Em período experimental';
  }

  if (subscription.status === 'ACTIVE') {
    return 'Ativa';
  }

  if (subscription.status === 'PAST_DUE') {
    return 'Pagamento pendente';
  }

  if (subscription.status === 'EXPIRED') {
    return 'Expirada';
  }

  if (subscription.status === 'CANCELED') {
    return 'Cancelada';
  }

  return subscription.status;
}

export default function BillingPage() {
  const router = useRouter();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [current, availablePlans] = await Promise.all([
        getCurrentSubscription(),
        getBillingPlans(),
      ]);

      setSubscription(current as Subscription);
      setPlans(availablePlans);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a subscrição.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const paidPlans = useMemo(
    () =>
      plans.filter((plan) =>
        ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan.code),
      ),
    [plans],
  );

  async function managePayment() {
    setAction('portal');
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      const body = await response.text();

      let data: { url?: string; message?: string } = {};

      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível abrir a faturação.');
      }

      if (!data.url) {
        throw new Error('O portal de faturação não devolveu um endereço válido.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir a faturação.',
      );
    } finally {
      setAction(null);
    }
  }

  async function cancelSubscription() {
    const confirmed = window.confirm(
      'Tem a certeza de que pretende cancelar a subscrição no final do período atual?',
    );

    if (!confirmed) {
      return;
    }

    setAction('cancel');
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      });

      const body = await response.text();

      let data: { message?: string } = {};

      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível cancelar a subscrição.');
      }

      setMessage('O cancelamento foi agendado para o final do período atual.');
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível cancelar a subscrição.',
      );
    } finally {
      setAction(null);
    }
  }

  async function reactivateSubscription() {
    setAction('reactivate');
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/billing/reactivate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      });

      const body = await response.text();

      let data: { message?: string } = {};

      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível reativar a subscrição.');
      }

      setMessage('A subscrição foi reativada.');
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível reativar a subscrição.',
      );
    } finally {
      setAction(null);
    }
  }

  async function selectPlan(planCode: string) {
    if (!subscription) {
      return;
    }

    if (planCode === subscription.plan.code) {
      return;
    }

    if (planCode === 'ENTERPRISE') {
      router.push('/enterprise');
      return;
    }

    const target = plans.find((plan) => plan.code === planCode);

    if (!target) {
      return;
    }

    const confirmed = window.confirm(
      `Alterar de ${subscription.plan.name} para ${target.name} (${formatPrice(target)})?`,
    );

    if (!confirmed) {
      return;
    }

    setAction(`plan-${planCode}`);
    setError(null);
    setMessage(null);

    try {
      const updated = await changePlan(planCode);
      setSubscription(updated as Subscription);
      setMessage(`O plano foi alterado para ${target.name}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar o plano.',
      );
    } finally {
      setAction(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-astra-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-astra-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (!subscription) {
    return (
      <main className="min-h-screen bg-astra-50 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-astra-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-astra-950">
            Subscrição e faturação
          </h1>
          <p className="mt-4 text-astra-600">
            Não foi possível encontrar uma subscrição para esta empresa.
          </p>
          <button
            type="button"
            onClick={() => router.push('/plans')}
            className="mt-8 rounded-xl bg-astra-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Ver planos
          </button>
        </div>
      </main>
    );
  }

  const isFree = subscription.plan.code === 'FREE';
  const isTrial = subscription.status === 'TRIALING';

  return (
    <main className="min-h-screen bg-astra-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-astra-500">
              Conta
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-astra-950">
              Subscrição e faturação
            </h1>
            <p className="mt-3 max-w-2xl text-astra-600">
              Gere o plano da sua empresa, os pagamentos e o estado da subscrição num único lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border border-astra-200 bg-white px-5 py-3 text-sm font-semibold text-astra-800 shadow-sm transition hover:border-astra-300"
          >
            Voltar ao dashboard
          </button>
        </div>

        {(error || message) && (
          <div
            className={
              error
                ? 'mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'
                : 'mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700'
            }
          >
            {error || message}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-astra-200 bg-white p-7 shadow-sm lg:col-span-2">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-medium text-astra-500">Plano atual</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-astra-950">
                    {subscription.plan.name}
                  </h2>
                  {subscription.plan.code === 'PROFESSIONAL' && (
                    <span className="rounded-full bg-astra-100 px-3 py-1 text-xs font-semibold text-astra-800">
                      ⭐ Mais popular
                    </span>
                  )}
                </div>
              </div>

              <span className="rounded-full bg-astra-100 px-4 py-2 text-sm font-semibold text-astra-800">
                {statusLabel(subscription)}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-astra-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-astra-500">
                  Preço
                </p>
                <p className="mt-2 text-lg font-semibold text-astra-950">
                  {formatPrice(subscription.plan)}
                </p>
              </div>

              <div className="rounded-2xl bg-astra-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-astra-500">
                  Período
                </p>
                <p className="mt-2 text-lg font-semibold text-astra-950">
                  {isTrial ? `Até ${formatDate(subscription.trialEnd)}` : 'Mensal'}
                </p>
              </div>

              <div className="rounded-2xl bg-astra-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-astra-500">
                  Próxima referência
                </p>
                <p className="mt-2 text-lg font-semibold text-astra-950">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                A subscrição está marcada para terminar no final do período atual.
                Pode reativá-la enquanto o período ainda estiver ativo.
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-astra-950 p-7 text-white shadow-xl">
            <p className="text-sm font-medium text-white/60">Pagamentos</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Gerir faturação
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Atualize o método de pagamento, consulte faturas e acompanhe a sua faturação através do portal seguro.
            </p>

            <button
              type="button"
              disabled={isFree || action === 'portal'}
              onClick={() => void managePayment()}
              className="mt-8 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-astra-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === 'portal' ? 'A abrir…' : 'Gerir pagamentos'}
            </button>

            {isFree && (
              <p className="mt-3 text-xs text-white/50">
                O plano Free não necessita de pagamentos.
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-astra-500">
                Evolução
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-astra-950">
                Alterar plano
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {paidPlans.map((plan) => {
              const current = plan.code === subscription.plan.code;
              const recommended = plan.code === 'PROFESSIONAL';
              const processing = action === `plan-${plan.code}`;

              return (
                <div
                  key={plan.code}
                  className={
                    current || recommended
                      ? 'rounded-3xl border-2 border-astra-900 bg-white p-6 shadow-md'
                      : 'rounded-3xl border border-astra-200 bg-white p-6 shadow-sm'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-astra-950">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-sm text-astra-600">
                        {formatPrice(plan)}
                      </p>
                    </div>

                    {recommended && (
                      <span className="rounded-full bg-astra-100 px-3 py-1 text-xs font-semibold text-astra-800">
                        ⭐ Recomendado
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={current || processing}
                    onClick={() => void selectPlan(plan.code)}
                    className={
                      current
                        ? 'mt-6 w-full rounded-xl border border-astra-200 bg-astra-50 px-4 py-3 text-sm font-semibold text-astra-500'
                        : 'mt-6 w-full rounded-xl bg-astra-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                    }
                  >
                    {processing
                      ? 'A processar…'
                      : current
                        ? 'Plano atual'
                        : plan.code === 'ENTERPRISE'
                          ? 'Falar com vendas'
                          : 'Alterar para este plano'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {!isFree && (
          <section className="mt-10 rounded-3xl border border-astra-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-astra-950">
              Gestão da subscrição
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-astra-600">
              Pode cancelar no final do período atual ou reativar uma subscrição que tenha sido marcada para cancelamento.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {subscription.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  disabled={action === 'reactivate'}
                  onClick={() => void reactivateSubscription()}
                  className="rounded-xl bg-astra-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {action === 'reactivate' ? 'A reativar…' : 'Reativar subscrição'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={action === 'cancel'}
                  onClick={() => void cancelSubscription()}
                  className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {action === 'cancel' ? 'A cancelar…' : 'Cancelar no final do período'}
                </button>
              )}

              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border border-astra-200 bg-white px-5 py-3 text-sm font-semibold text-astra-700"
              >
                Atualizar estado
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
