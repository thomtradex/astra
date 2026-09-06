'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

        window.setTimeout(async () => {
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

      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center shadow-2xl backdrop-blur md:p-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
          {error ? (
            <span className="text-xl text-amber-300">!</span>
          ) : (
            <span className="text-xl text-cyan-300">✓</span>
          )}
        </div>

        <p className="mt-7 text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
          Astra
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {error ? 'Quase tudo pronto' : 'Subscrição ativada'}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/60">
          {status}
        </p>

        {error && (
          <button
            type="button"
            onClick={() => router.replace('/dashboard')}
            className="mt-8 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
          >
            Continuar para a plataforma
          </button>
        )}

        {!error && (
          <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300" />
          </div>
        )}
      </div>
    </main>
  );
}
