import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-5xl font-light text-astra-950">Capacidade operacional para decidir melhor</h1>

        <p className="mt-6 max-w-3xl text-lg text-astra-600">
          A Astra centraliza ativos, manutenção, equipas e operações numa única plataforma
          que transforma informação operacional em contexto e ação.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {['Gestão de ativos', 'Manutenção preventiva', 'Inteligência operacional'].map((item) => (
            <div key={item} className="rounded-2xl border p-8">
              <h2 className="text-xl font-semibold">{item}</h2>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
