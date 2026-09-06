import { DemoRequestForm } from '@/components/forms/demo-request-form';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const isEnterpriseCustom = params.plan === 'ENTERPRISE_CUSTOM';

  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-astra-500">
          {isEnterpriseCustom ? 'Enterprise Personalizado' : 'Contacto'}
        </p>

        <h1 className="mt-6 text-5xl font-light text-astra-950">
          {isEnterpriseCustom
            ? 'Vamos avaliar a sua operação'
            : 'Fale com a equipa Astra'}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-astra-600">
          {isEnterpriseCustom
            ? 'Partilhe informação sobre a sua empresa e os seus projetos. A equipa Astra irá avaliar as suas necessidades e definir uma configuração Enterprise adequada à sua operação.'
            : 'Descubra como a Astra pode ajudar a sua empresa a controlar ativos, manutenção e operações de construção numa única plataforma.'}
        </p>

        <div className="mt-12 rounded-2xl border border-astra-200 p-8">
          <DemoRequestForm enterpriseCustom={isEnterpriseCustom} />
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
