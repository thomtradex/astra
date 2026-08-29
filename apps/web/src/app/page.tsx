import Link from 'next/link';

import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-32">
        <h1 className="max-w-4xl text-6xl font-light text-astra-950">
          Inteligência operacional para construção empresarial.
        </h1>

        <p className="mt-8 max-w-2xl text-xl text-astra-600">
          Controle projetos, ativos, manutenção e operações numa única plataforma inteligente.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/demo"
            className="rounded-lg bg-astra-900 px-6 py-3 text-white"
          >
            Agendar Demo
          </Link>

          <Link
            href="/login"
            className="rounded-lg border px-6 py-3"
          >
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}
