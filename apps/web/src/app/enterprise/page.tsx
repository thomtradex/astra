import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

import Link from 'next/link';

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="max-w-4xl text-5xl font-light text-astra-950">
          A plataforma operacional para construção empresarial.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-astra-600">
          Astra liga pessoas, equipamentos e processos para empresas que operam
          projetos complexos.
        </p>

        <Link
          href="/demo"
          className="mt-10 inline-block rounded-lg bg-astra-900 px-6 py-3 text-white"
        >
          Falar com a equipa Astra
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-4">
        {[
          'Gestão operacional',
          'Manutenção inteligente',
          'Asset intelligence',
          'Enterprise analytics',
        ].map((item) => (
          <div key={item} className="rounded-xl border p-6">
            {item}
          </div>
        ))}
      </section>
          <MarketingFooter />
    </main>
  );
}
