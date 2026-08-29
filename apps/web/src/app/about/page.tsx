import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-light text-astra-950">
          Sobre a Astra
        </h1>

        <p className="mt-6 text-lg text-astra-600">
          Construímos tecnologia para tornar operações de construção mais
          previsíveis, eficientes e inteligentes.
        </p>
      </section>
    </main>
  );
}
