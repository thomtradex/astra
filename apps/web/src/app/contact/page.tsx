import { DemoRequestForm } from '@/components/forms/demo-request-form';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-light text-astra-950">
          Fale com a equipa Astra
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-astra-600">
          Descubra como a Astra pode ajudar a sua empresa a controlar ativos,
          manutenção e operações de construção numa única plataforma.
        </p>

        <div className="mt-12 rounded-2xl border p-8">
          <DemoRequestForm />
        </div>
      </section>
          <MarketingFooter />
    </main>
  );
}
