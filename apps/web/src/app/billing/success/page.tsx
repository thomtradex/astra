'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCurrentSubscription } from '@/lib/billing-client';

export default function BillingSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState('A confirmar a sua subscrição…');
  const [error, setError] = useState(false);

  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;
    let retryTimer: number | undefined;
    let redirectTimer: number | undefined;

    async function confirmSubscription() {
      setIsChecking(true);
      setError(false);
      setStatus('A confirmar a sua subscrição…');

      try {
        const subscription = await getCurrentSubscription();

        if (!active) return;

        if (subscription) {
          setStatus('Subscrição confirmada. A preparar a sua empresa…');
          redirectTimer = window.setTimeout(() => {
            if (active) {
              router.replace('/onboarding');
              router.refresh();
            }
          }, 900);
          return;
        }

        if (retryAttempt === 0) {
          setStatus('Estamos a sincronizar a confirmação do pagamento…');
          retryTimer = window.setTimeout(() => {
            if (active) {
              setRetryAttempt(1);
            }
          }, 2500);
          return;
        }

        setError(true);
        setStatus('A confirmação ainda não ficou disponível.');
      } catch {
        if (active) {
          setError(true);
          setStatus('Não foi possível confirmar a subscrição. Verifique a sessão e tente novamente.');
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    }

    void confirmSubscription();

    return () => {
      active = false;

      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }

      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [router, retryAttempt]);

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
            onClick={() => setRetryAttempt((current) => current + 1)}
            disabled={isChecking}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? 'A verificar…' : 'Tentar novamente'}
          </button>
        )}
      </div>
    </main>
  );
}
