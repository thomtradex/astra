'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({
  fallbackHref = '/plans',
  label = 'Voltar',
}: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-astra-900 focus:outline-none focus:ring-2 focus:ring-astra-500 focus:ring-offset-2"
    >
      <span aria-hidden="true" className="text-lg leading-none">←</span>
      <span>{label}</span>
    </button>
  );
}
