'use client';

import { useRouter } from 'next/navigation';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl border p-10 text-center">
        <h1 className="text-3xl font-light">Checkout cancelado</h1>

        <p className="mt-4 text-gray-600">Pode voltar e escolher outro plano.</p>

        <button
          onClick={() => router.push('/plans')}
          className="mt-8 rounded-xl bg-astra-900 px-6 py-3 text-white"
        >
          Voltar aos planos
        </button>
      </div>
    </main>
  );
}
