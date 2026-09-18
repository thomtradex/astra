'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCurrentSubscription } from '@/lib/billing-client';

export default function BillingSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState('A confirmar a sua subscrição…');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function confirmSubscription() {
      try {
        const subscription = await getCurrentSubscription();

        if (!active) return;

        if (subscription) {
          setStatus('Subscrição confirmada. A preparar a sua empresa…');
          window.setTimeout(() => {
            if (active) {
              router.replace('/onboarding');
              router.refresh();
            }
          }, 900);
          return;
        }

        setStatus('Estamos a sincronizar a confirmação do pagamento…');

        window.setTimeout(() => {
          void (async () => {
            try {
              const retry = await getCurrentSubscription();

              if (!active) return;

              if (retry) {
                router.replace('/onboarding');
                router.refresh();
                return;
              }

              setError(true);
              setStatus('A confirmação ainda não ficou disponível.');
            } catch {
              if (active) {
                setError(true);
                setStatus('Não foi possível confirmar a subscrição.');
              }
            }
          })();
        }, 2500);
      } catch {
        if (active) {
          setError(true);
          setStatus('Não foi possível confirmar a subscrição.');
        }
      }
    }

    void confirmSubscription();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)]" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          {error ? '!' : '✓'}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {error ? 'Confirmação pendente' : 'Pagamento recebido'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-300">{status}</p>

        {error && (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </main>
  );
}
