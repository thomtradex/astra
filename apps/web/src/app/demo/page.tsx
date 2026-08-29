import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

import { DemoRequestForm } from '@/components/forms/demo-request-form';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />
      <section className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-5xl font-light">
          Agende uma demonstração Astra
        </h1>

        <p className="mt-6 text-lg text-astra-600">
          Veja como empresas de construção podem reduzir custos,
          melhorar controlo operacional e tomar decisões melhores.
        </p>

        <div className="mt-10 rounded-2xl border p-8">
          <DemoRequestForm />
        </div>
      </section>
          <MarketingFooter />
    </main>
  );
}
