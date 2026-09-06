'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  activateFreePlan,
  createCheckout,
  getBillingPlans,
  type BillingPlan,
} from '@/lib/billing-client';

const PLAN_PRESENTATION: Record<
  string,
  {
    description: string;
    cta: string;
    badge?: string;
    priceLabel: string;
    note?: string;
  }
> = {
  FREE: {
    description:
      'Conheça a Astra e comece a organizar a operação da sua empresa com as funcionalidades essenciais.',
    cta: 'Começar gratuitamente',
    priceLabel: '€0',
    note: 'Gratuito para sempre',
  },
  STARTER: {
    description:
      'Comece a trabalhar com mais capacidade, colaboração e funcionalidades avançadas.',
    cta: 'Começar teste grátis',
    priceLabel: '€99',
    note: '14 dias grátis',
  },
  PROFESSIONAL: {
    description:
      'Opere a empresa de forma mais completa, com maior capacidade, controlo e funcionalidades avançadas.',
    cta: 'Começar',
    badge: '⭐ Mais popular',
    priceLabel: '€249',
    note: 'Plano recomendado para crescimento',
  },
  ENTERPRISE: {
    description:
      'Para empresas de maior dimensão que precisam de escala, suporte, integrações e configuração personalizada.',
    cta: 'Falar com vendas',
    priceLabel: 'Desde €599',
    note: 'Preço ajustado às necessidades',
  },
};

const FEATURE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard operacional',
  customerManagement: 'Gestão de clientes',
  siteManagement: 'Gestão de sites',
  assetManagement: 'Gestão de equipamentos',
  workOrderManagement: 'Ordens de trabalho',
  maintenanceManagement: 'Gestão de manutenção',
  basicReports: 'Relatórios operacionais',
  aiAssistant: 'Assistência inteligente',
  intelligence: 'Inteligência operacional',
  auditLogs: 'Histórico e auditabilidade',
  multiSiteOperations: 'Operação multi-site',
  prioritySupport: 'Suporte prioritário',
  dedicatedSupport: 'Suporte dedicado',
};

function formatPrice(plan: BillingPlan) {
  if (plan.code === 'ENTERPRISE') {
    return 'Desde €599';
  }

  if (plan.monthlyPriceCents === 0) {
    return '€0';
  }

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: plan.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(plan.monthlyPriceCents / 100);
}

export default function PlanSelector() {
  const router = useRouter();

  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBillingPlans()
      .then((result) => {
        if (!cancelled) {
          setPlans(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os planos.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function choosePlan(planCode: string) {
    const code = planCode.toUpperCase();

    setLoading(code);
    setError(null);

    try {
      if (code === 'FREE') {
        await activateFreePlan();
        router.push('/dashboard');
        router.refresh();
        return;
      }

      if (code === 'ENTERPRISE') {
        router.push('/enterprise');
        return;
      }

      const checkout = await createCheckout(code);

      if (checkout?.url) {
        window.location.href = checkout.url;
        return;
      }

      throw new Error('Não foi possível iniciar o pagamento.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível selecionar este plano.',
      );
    } finally {
      setLoading(null);
    }
  }

  if (error && plans.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => {
          const presentation =
            PLAN_PRESENTATION[plan.code] ?? PLAN_PRESENTATION.FREE!;

          const recommended = plan.code === 'PROFESSIONAL';

          return (
            <div
              key={plan.code}
              className={
                recommended
                  ? 'relative rounded-3xl border-2 border-astra-900 bg-white p-8 shadow-xl'
                  : 'relative rounded-3xl border border-astra-200 bg-white p-8 shadow-sm'
              }
            >
              {presentation.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-astra-900 px-4 py-1 text-sm font-semibold text-white">
                  {presentation.badge}
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold text-astra-950">
                  {plan.name}
                </h2>
              </div>

              <p className="mt-4 min-h-20 text-astra-600">
                {presentation.description}
              </p>

              <div className="mt-8">
                <span className="text-4xl font-semibold text-astra-950">
                  {presentation.priceLabel || formatPrice(plan)}
                </span>

                {plan.code !== 'ENTERPRISE' && (
                  <span className="text-base text-astra-500"> / mês</span>
                )}
              </div>

              {presentation.note && (
                <p className="mt-3 text-sm font-semibold text-astra-700">
                  {presentation.note}
                </p>
              )}

              {plan.code === 'STARTER' && (
                <p className="mt-2 text-sm text-astra-600">
                  Após os 14 dias, a subscrição será renovada automaticamente
                  por €99/mês, salvo cancelamento.
                </p>
              )}

              {plan.code === 'ENTERPRISE' && (
                <p className="mt-2 text-sm text-astra-600">
                  €599/mês é o ponto de entrada do Enterprise Standard.
                </p>
              )}

              <ul className="mt-8 min-h-32 space-y-3 text-sm text-astra-700">
                {Object.entries(plan.features ?? {}).map(([feature, enabled]) =>
                  enabled === true ? (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden="true">✓</span>
                      <span>{FEATURE_LABELS[feature] ?? feature}</span>
                    </li>
                  ) : null,
                )}
              </ul>

              <button
                type="button"
                disabled={loading === plan.code}
                onClick={() => choosePlan(plan.code)}
                className={
                  recommended
                    ? 'mt-10 w-full rounded-xl bg-astra-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                    : 'mt-10 w-full rounded-xl border border-astra-900 bg-astra-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                }
              >
                {loading === plan.code ? 'A processar...' : presentation.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
