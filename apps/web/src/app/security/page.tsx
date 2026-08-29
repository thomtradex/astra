import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-light text-astra-950">
          Segurança enterprise
        </h1>

        <p className="mt-6 text-lg text-astra-600">
          Arquitetura preparada para organizações, permissões, auditoria e
          isolamento multi-tenant.
        </p>
      </section>
          <MarketingFooter />
    </main>
  );
}
