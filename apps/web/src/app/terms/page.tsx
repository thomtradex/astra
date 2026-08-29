import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-light">
          Termos de Serviço
        </h1>

        <p className="mt-6 text-astra-600">
          Termos de utilização da plataforma Astra.
        </p>
      </section>
    </main>
  );
}
