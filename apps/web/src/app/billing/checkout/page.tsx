'use client';

import { BackButton } from '@/components/navigation/back-button';
import {Suspense, useEffect, useState} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  activateFreePlan,
  createCheckout,
  getBillingPlans,
  type BillingPlan,
} from '@/lib/billing-client';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Astra Free',
  STARTER: 'Astra Starter',
  PROFESSIONAL: 'Astra Professional',
  ENTERPRISE: 'Astra Enterprise',
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  FREE: 'Operação centralizada para começar sem compromisso e sem limite de tempo.',
  STARTER: 'Controlo operacional, ativos e manutenção para pequenas equipas.',
  PROFESSIONAL: 'Visibilidade avançada para equipas que precisam de escalar com controlo.',
  ENTERPRISE: 'Operação empresarial com maior capacidade, controlo e suporte.',
};

function formatPrice(plan: BillingPlan | undefined) {
  if (!plan) return '—';

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: plan.currency || 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(plan.monthlyPriceCents / 100);
}

function BillingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlan = (searchParams.get('plan') || 'FREE').toUpperCase();

  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);


const FALLBACK_PLANS: Record<string, BillingPlan> = {
    FREE: {
      code: 'FREE',
      name: 'Astra Free',
      description: 'Operação centralizada para começar sem compromisso e sem limite de tempo.',
      monthlyPriceCents: 0,
      currency: 'EUR',
      trialDays: 0,
    },
    STARTER: {
      code: 'STARTER',
      name: 'Astra Starter',
      description: 'Para pequenas empresas de construção que precisam de centralização operacional, controlo de ativos e gestão de manutenção.',
      monthlyPriceCents: 9900,
      currency: 'EUR',
      trialDays: 14,
    },
    PROFESSIONAL: {
      code: 'PROFESSIONAL',
      name: 'Astra Professional',
      description: 'Gestão operacional avançada para empresas de construção em crescimento.',
      monthlyPriceCents: 24900,
      currency: 'EUR',
      trialDays: 0,
    },
    ENTERPRISE: {
      code: 'ENTERPRISE',
      name: 'Astra Enterprise',
      description: 'Controlo completo para operações de construção de maior escala.',
      monthlyPriceCents: 59900,
      currency: 'EUR',
      trialDays: 0,
    },
  };

  const plan =
    plans.find((item) => item.code.toUpperCase() === requestedPlan) ||
    FALLBACK_PLANS[requestedPlan] ||
    FALLBACK_PLANS.FREE;

  useEffect(() => {
    let active = true;

    getBillingPlans()
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os planos.',
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!plan) return;

    setProcessing(true);
    setError(null);

    try {
      if (plan.code === 'FREE') {
        await activateFreePlan();
        router.push('/onboarding');
        return;
      }

      const checkout = await createCheckout(plan.code);
      if (!checkout?.url) {
        throw new Error('A sessão de pagamento não foi criada.');
      }

      window.location.assign(checkout.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar o processo de pagamento.',
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loadingPlans) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

      <div className="fixed left-6 top-6 z-50"><BackButton fallbackHref="/plans" label="Voltar aos planos" /></div>
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="mt-5 text-sm text-white/60">
              A preparar o seu plano…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Astra
            </p>
            <h1 className="mt-5 text-3xl font-semibold">
              Plano não encontrado
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              O plano selecionado já não está disponível. Escolha novamente
              entre os planos ativos da Astra.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/plans?plan=${encodeURIComponent(requestedPlan)}`)}
              className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Ver planos
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isFree = plan.code === 'FREE';
  const isStarter = plan.code === 'STARTER';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_65%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/plans?plan=${encodeURIComponent(requestedPlan)}`,
              )
            }
            className="text-sm text-white/60 transition hover:text-white"
          >
            ← Voltar à configuração do plano
          </button>

          <div className="text-sm font-semibold tracking-[0.2em] text-white">
            ASTRA
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
            Configuração do plano
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            Comece a transformar a sua operação.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Confirme o plano escolhido. A Astra mantém o processo simples,
            transparente e preparado para a realidade das empresas de construção.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur md:p-9">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-white/45">Plano selecionado</p>
                <h2 className="mt-2 text-3xl font-semibold">
                  {PLAN_LABELS[plan.code] || plan.name}
                </h2>
              </div>

              {isStarter && (
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  14 dias grátis
                </span>
              )}
            </div>

            <p className="mt-6 text-base leading-7 text-white/60">
              {plan.description || PLAN_DESCRIPTIONS[plan.code]}
            </p>

            <div className="mt-9 border-t border-white/10 pt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">Investimento</p>
                  <p className="mt-2 text-4xl font-semibold">
                    {formatPrice(plan)}
                    {!isFree && (
                      <span className="ml-2 text-base font-normal text-white/45">
                        /mês
                      </span>
                    )}
                  </p>
                </div>

                {plan.trialDays > 0 && (
                  <p className="text-right text-sm text-cyan-200">
                    Sem cobrança durante {plan.trialDays} dias
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex gap-3 text-sm text-white/70">
                <span className="text-cyan-300">✓</span>
                <span>Processo de adesão simples e seguro</span>
              </div>
              <div className="flex gap-3 text-sm text-white/70">
                <span className="text-cyan-300">✓</span>
                <span>Dados e operação centralizados numa única plataforma</span>
              </div>
              <div className="flex gap-3 text-sm text-white/70">
                <span className="text-cyan-300">✓</span>
                <span>Escalável à medida que a sua empresa cresce</span>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white p-7 text-slate-950 shadow-2xl md:p-9">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              {isFree ? 'Ativação' : 'Pagamento seguro'}
            </p>

            <h2 className="mt-4 text-2xl font-semibold">
              {isFree
                ? 'Ative a Astra Free'
                : 'Continue para o pagamento'}
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {isFree
                ? 'O plano Free custa €0 e não tem prazo de expiração. A ativação será feita depois da autenticação da sua conta.'
                : 'Será encaminhado para o checkout seguro para concluir a subscrição. Os dados de pagamento são processados pelo nosso fornecedor de pagamentos.'}
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={processing}
              onClick={handleContinue}
              className="mt-8 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? 'A preparar…'
                : isFree
                  ? 'Ativar Astra Free'
                  : 'Continuar para pagamento'}
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Pode rever o plano antes de concluir. Sem alterações escondidas.
              ao preço apresentado.
            </p>
          </aside>
        </div>

        <div className="mx-auto mt-10 max-w-5xl text-center text-sm text-white/35">
          Astra Operational Intelligence · Construída para empresas que
          precisam de executar melhor.
        </div>
      </div>
    </main>
  );
}


function BillingCheckoutLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-5 text-sm text-white/60">
            A preparar o checkout…
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BillingCheckoutPage() {
  return (
    <Suspense fallback={<BillingCheckoutLoading />}>
      <BillingCheckoutContent />
    </Suspense>
  );
}
