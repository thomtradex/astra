import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-light">
          Planos Astra
        </h1>

        <p className="mt-6 text-lg text-astra-600">
          Soluções adaptadas para equipas pequenas,
          operações industriais e empresas enterprise.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Starter',
              text: 'Operações pequenas',
            },
            {
              name: 'Business',
              text: 'Equipas em crescimento',
            },
            {
              name: 'Enterprise',
              text: 'Grandes operações',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border p-8"
            >
              <h2 className="text-xl font-semibold">
                {plan.name}
              </h2>

              <p className="mt-3 text-astra-600">
                {plan.text}
              </p>
            </div>
          ))}
        </div>
      </section>
          <MarketingFooter />
    </main>
  );
}
