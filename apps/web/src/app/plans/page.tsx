'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBillingPlans, type BillingPlan } from '@/lib/billing-client';

function BackButtonToHome() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/')}
      aria-label="Voltar"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-astra-900 focus:outline-none focus:ring-2 focus:ring-astra-500 focus:ring-offset-2"
    >
      <span aria-hidden="true" className="text-lg leading-none">←</span>
      <span>Voltar</span>
    </button>
  );
}

type Plan = {
  id: string;
  code: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  description: string;
  monthlyPriceCents: number;
  currency: string;
  trialDays: number;
  isActive: boolean;
  displayOrder: number;
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
};

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free',
    code: 'FREE',
    name: 'Free',
    description: 'Conheça a Astra e comece a organizar a sua operação.',
    monthlyPriceCents: 0,
    currency: 'EUR',
    trialDays: 0,
    isActive: true,
    displayOrder: 0,
    features: {},
    limits: {},
  },
  {
    id: 'starter',
    code: 'STARTER',
    name: 'Starter',
    description: 'Comece a trabalhar com uma operação centralizada e profissional.',
    monthlyPriceCents: 9900,
    currency: 'EUR',
    trialDays: 14,
    isActive: true,
    displayOrder: 1,
    features: {},
    limits: {},
  },
  {
    id: 'professional',
    code: 'PROFESSIONAL',
    name: 'Professional',
    description: 'Tenha uma visão mais completa, automatize processos e cresça com controlo.',
    monthlyPriceCents: 24900,
    currency: 'EUR',
    trialDays: 0,
    isActive: true,
    displayOrder: 2,
    features: {},
    limits: {},
  },
  {
    id: 'enterprise',
    code: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Escala máxima, controlo avançado e configuração adaptada à sua organização.',
    monthlyPriceCents: 59900,
    currency: 'EUR',
    trialDays: 0,
    isActive: true,
    displayOrder: 3,
    features: {},
    limits: {},
  },
];

const PLAN_CONTENT: Record<Plan['code'], {
  eyebrow: string;
  headline: string;
  bullets: string[];
  accent: string;
}> = {
  FREE: {
    eyebrow: 'Descoberta',
    headline: 'Conheça a Astra sem compromisso.',
    bullets: [
      'Configuração inicial da empresa',
      'Dashboard e operação essencial',
      'Gestão dos recursos essenciais',
      'Limites controlados para começar',
    ],
    accent: 'Comece sem compromisso.',
  },
  STARTER: {
    eyebrow: 'Primeiro passo profissional',
    headline: 'Comece a trabalhar com a Astra na sua operação.',
    bullets: [
      'Operação centralizada',
      'Gestão de sites, ativos e clientes',
      'Manutenção e ordens de trabalho',
      'Relatórios e assistência inteligente',
      '14 dias para provar o valor na prática',
    ],
    accent: 'Ideal para equipas pequenas.',
  },
  PROFESSIONAL: {
    eyebrow: 'Mais popular',
    headline: 'Passe da operação à decisão com a Astra COO.',
    bullets: [
      'Tudo do Starter',
      'Mais utilizadores, sites e capacidade',
      'Inteligência operacional e briefing COO',
      'Sinais, prioridades e recomendações operacionais',
      'Maior capacidade para equipas e operações',
    ],
    accent: 'A escolha para empresas que precisam de decidir melhor e mais cedo.',
  },
  ENTERPRISE: {
    eyebrow: 'Escala',
    headline: 'Uma plataforma preparada para operações complexas.',
    bullets: [
      'Tudo do Professional',
      'Grande escala de utilizadores e recursos',
      'Segurança e controlo empresarial',
      'Configuração e suporte adaptados à organização',
      'Suporte dedicado',
      'Configuração adaptada às necessidades da organização',
    ],
    accent: 'A partir de €599/mês.',
  },
};

function formatPrice(plan: Plan) {
  if (plan.code === 'ENTERPRISE') return 'A partir de';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(plan.monthlyPriceCents / 100);
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const response = await fetch('/api/billing/plans', {
          cache: 'no-store',
        });

        if (!response.ok) throw new Error('Não foi possível carregar os planos.');

        const data = await response.json();

        if (active && Array.isArray(data) && data.length) {
          setPlans(
            data
              .filter((plan: Plan) => plan.isActive)
              .sort((a: Plan, b: Plan) => a.displayOrder - b.displayOrder),
          );
        }
      } catch {
        if (active) setError('Estamos a apresentar os planos disponíveis. Pode continuar normalmente.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      active = false;
    };
  }, []);

  const orderedPlans = useMemo(
    () =>
      [...plans].sort((a, b) => {
        const order = { FREE: 0, STARTER: 1, PROFESSIONAL: 2, ENTERPRISE: 3 };
        return order[a.code] - order[b.code];
      }),
    [plans],
  );

  async function choosePlan(plan: Plan) {
    const code = plan.code;

    if (code === 'ENTERPRISE') {
      router.push('/enterprise');
      return;
    }

    router.push(`/billing/checkout?plan=${encodeURIComponent(code)}`);
  }

  return (
    <main className="min-h-screen bg-white text-astra-950">

      <div className="fixed left-6 top-6 z-50"><BackButtonToHome /></div>
      <section className="relative overflow-hidden border-b border-astra-100 bg-gradient-to-b from-astra-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-astra-200 bg-white px-4 py-2 text-sm font-medium text-astra-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Plataforma operacional para empresas de construção
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-astra-950 sm:text-6xl lg:text-7xl">
              O plano certo para a dimensão da sua operação.
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-astra-600 sm:text-xl">
              Comece de forma simples, prove valor na operação e evolua para uma plataforma capaz de acompanhar o crescimento da sua empresa.
            </p>

            <div className="mt-9 flex flex-wrap gap-3 text-sm text-astra-600">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-astra-200">
                Sem contratos escondidos
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-astra-200">
                Upgrade quando precisar
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-astra-200">
                Feito para crescer consigo
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        {error && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {orderedPlans.map((plan) => {
            const content = PLAN_CONTENT[plan.code];
            const professional = plan.code === 'PROFESSIONAL';
            const starter = plan.code === 'STARTER';
            const enterprise = plan.code === 'ENTERPRISE';

            return (
              <article
                key={plan.code}
                className={[
                  'group relative flex h-full flex-col rounded-3xl border bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl',
                  professional
                    ? 'border-astra-950 shadow-2xl ring-2 ring-astra-950/10 lg:-translate-y-3'
                    : 'border-astra-200',
                ].join(' ')}
              >
                {professional && (
                  <div className="absolute -top-4 left-6 rounded-full bg-astra-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                    ⭐ Mais popular
                  </div>
                )}

                <div className="mb-7">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-astra-500">
                    {content.eyebrow}
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold text-astra-950">
                    {plan.name}
                  </h2>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-astra-600">
                    {plan.description}
                  </p>
                </div>

                <div className="border-y border-astra-100 py-6">
                  {enterprise ? (
                    <>
                      <div className="text-sm font-medium text-astra-500">
                        A partir de
                      </div>
                      <div className="mt-1 text-4xl font-semibold tracking-tight text-astra-950">
                        €599
                      </div>
                      <div className="mt-1 text-sm text-astra-500">
                        /mês
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-semibold tracking-tight text-astra-950">
                        {formatPrice(plan)}
                      </div>
                      <div className="mt-1 text-sm text-astra-500">
                        {plan.code === 'FREE' ? 'para sempre' : '/mês'}
                      </div>
                    </>
                  )}

                  {starter && (
                    <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      14 dias grátis
                    </div>
                  )}

                  {plan.code === 'FREE' && (
                    <div className="mt-4 text-xs font-medium text-astra-500">
                      Sem cartão de crédito
                    </div>
                  )}

                  {professional && (
                    <div className="mt-4 text-xs font-semibold text-astra-700">
                      Para empresas em crescimento
                    </div>
                  )}
                </div>

                <div className="flex-1 py-7">
                  <p className="mb-5 text-sm font-semibold text-astra-950">
                    {content.accent}
                  </p>

                  <ul className="space-y-3">
                    {content.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-astra-700">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-astra-100 text-xs font-bold text-astra-800">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={busy !== null || loading}
                  onClick={() => void choosePlan(plan)}
                  className={[
                    'w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition',
                    professional
                      ? 'bg-astra-950 text-white hover:bg-astra-800'
                      : enterprise
                        ? 'border border-astra-300 bg-white text-astra-950 hover:bg-astra-50'
                        : 'bg-astra-100 text-astra-950 hover:bg-astra-200',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  ].join(' ')}
                >
                  {busy === plan.code
                    ? 'A preparar...'
                    : plan.code === 'FREE'
                      ? 'Começar gratuitamente'
                      : plan.code === 'STARTER'
                        ? 'Começar teste grátis'
                        : plan.code === 'PROFESSIONAL'
                          ? 'Começar'
                          : 'Falar com vendas'}
                </button>

                {starter && (
                  <p className="mt-3 text-center text-xs leading-5 text-astra-500">
                    €0 hoje. Após os 14 dias, €99/mês, salvo cancelamento.
                  </p>
                )}

                {enterprise && (
                  <p className="mt-3 text-center text-xs leading-5 text-astra-500">
                    O valor final pode aumentar de acordo com dimensão, utilização e necessidades de personalização.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-astra-100 bg-astra-50/60">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-astra-500">
              Uma evolução natural
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-astra-950 sm:text-4xl">
              Não está a comprar apenas funcionalidades. Está a preparar a sua operação para crescer.
            </h2>
            <p className="mt-5 text-base leading-7 text-astra-600">
              A Astra acompanha a maturidade da empresa: começa por simplificar o essencial, ajuda a profissionalizar a operação e, quando a complexidade aumenta, oferece mais capacidade, automação, inteligência e controlo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              ['01', 'Free', 'Conhecer', 'Descubra a plataforma e comece sem compromisso.'],
              ['02', 'Starter', 'Trabalhar', 'Passe a utilizar a Astra na operação real.'],
              ['03', 'Professional', 'Crescer', 'Ganhe controlo, automação e inteligência.'],
              ['04', 'Enterprise', 'Escalar', 'Adapte a plataforma à complexidade da organização.'],
            ].map(([number, title, verb, text]) => (
              <div key={title} className="rounded-2xl border border-astra-200 bg-white p-6">
                <div className="text-xs font-bold text-astra-400">{number}</div>
                <div className="mt-4 text-lg font-semibold text-astra-950">{title}</div>
                <div className="mt-1 text-sm font-semibold text-astra-700">{verb}</div>
                <p className="mt-3 text-sm leading-6 text-astra-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-astra-500">
            Transparência
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-astra-950">
            Perguntas que todas as empresas fazem.
          </h2>
        </div>

        <div className="mt-10 divide-y divide-astra-200 rounded-3xl border border-astra-200 bg-white">
          {[
            ['Posso começar gratuitamente?', 'Sim. O Free permite conhecer e utilizar o essencial da Astra sem subscrição paga.'],
            ['Como funciona o Starter?', 'Tem 14 dias de teste. O valor é €0 inicialmente e, se não cancelar, a subscrição passa para €99/mês.'],
            ['O Professional tem período experimental?', 'Não. O Professional é uma subscrição de €249/mês e foi desenhado para empresas que já procuram maior capacidade e controlo.'],
            ['O Enterprise custa exatamente €599?', '€599/mês é o ponto de entrada. Empresas maiores podem ter uma configuração e preço superiores de acordo com dimensão, utilização, suporte e personalização.'],
            ['Posso mudar de plano?', 'Sim. A estratégia Astra permite evoluir para um plano superior e também fazer downgrade quando fizer sentido para a empresa.'],
          ].map(([question, answer]) => (
            <div key={question} className="p-6 sm:p-7">
              <h3 className="font-semibold text-astra-950">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-astra-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-astra-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                Próximo passo
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A melhor forma de perceber a Astra é começar a utilizá-la.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/65">
                Comece gratuitamente ou experimente o Starter durante 14 dias. Quando a sua operação crescer, a Astra cresce consigo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
  const freePlan = orderedPlans.find((plan) => plan.code === 'FREE');
  if (freePlan) void choosePlan(freePlan);
}}
              className="shrink-0 rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-astra-950 transition hover:bg-white/90"
            >
              Começar grátis
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
