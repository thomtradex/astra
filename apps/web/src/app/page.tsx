import Link from 'next/link';

import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.25em] text-astra-500">
            Astra Platform
          </p>

          <h1 className="mt-6 text-6xl font-light leading-tight text-astra-950">
            Inteligência operacional para empresas de construção.
          </h1>

          <p className="mt-8 text-xl text-astra-600">
            Controle projetos, ativos, manutenção e equipas numa única
            plataforma empresarial.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/demo"
              className="rounded-lg bg-astra-900 px-8 py-4 text-white"
            >
              Agendar demonstração
            </Link>

            <Link
              href="/enterprise"
              className="rounded-lg border px-8 py-4"
            >
              Conhecer Enterprise
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-32 md:grid-cols-3">
        {[
          'Gestão de projetos',
          'Inteligência de ativos',
          'Manutenção preditiva',
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border p-8"
          >
            <h2 className="text-xl font-medium text-astra-950">
              {item}
            </h2>
          </div>
        ))}
      </section>
    </main>
  );
}
