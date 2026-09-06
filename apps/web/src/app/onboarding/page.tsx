import { CompanySetup } from '@/components/onboarding/company-setup';
import { BackButton } from '@/components/navigation/back-button';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <BackButton fallbackHref="/plans" />
        </div>

        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-astra-600">
            Astra
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-astra-950">
            Bem-vindo à plataforma
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Vamos preparar a sua empresa para começar a trabalhar com a Astra.
          </p>
        </div>

        <CompanySetup />
      </div>
    </main>
  );
}
