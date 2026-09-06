import Link from 'next/link';

import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-white text-astra-950">
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.3em] text-astra-500">
            Astra Enterprise
          </p>

          <h1 className="mt-6 text-5xl font-light">
            A plataforma operacional para construção empresarial.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-astra-600">
            Ligue pessoas, equipamentos, manutenção e operações numa única plataforma
            preparada para empresas com operações complexas.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-astra-200 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-astra-500">
              Enterprise Standard
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              €599<span className="text-base font-normal text-astra-500"> / mês</span>
            </h2>

            <p className="mt-4 leading-7 text-astra-600">
              A experiência Enterprise completa com preço transparente e acesso direto
              ao pagamento através da Astra.
            </p>

            <Link
              href="/billing/checkout?plan=ENTERPRISE"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-astra-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-astra-800"
            >
              Escolher Enterprise Standard
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-astra-900 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-astra-500">
              Enterprise Personalizado
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              Avaliação personalizada
            </h2>

            <p className="mt-4 leading-7 text-astra-600">
              Explique-nos a dimensão da sua operação, número de obras, necessidades
              específicas e processos críticos. A equipa Astra avalia o cenário e
              prepara uma solução adequada à sua organização.
            </p>

            <Link
              href="/contact?plan=ENTERPRISE_CUSTOM"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-astra-300 px-5 py-3 text-sm font-medium text-astra-900 transition hover:bg-astra-50"
            >
              Personalizar Enterprise
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-4">
        {[
          'Gestão operacional',
          'Manutenção orientada por contexto',
          'Asset intelligence',
          'Enterprise analytics',
        ].map((item) => (
          <div key={item} className="rounded-xl border border-astra-200 p-6">
            {item}
          </div>
        ))}
      </section>

      <MarketingFooter />
    </main>
  );
}
