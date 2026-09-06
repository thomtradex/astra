'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { rescheduleMaintenance } from './actions/maintenance-actions';

interface MaintenanceDecisionActionProps {
  maintenancePlanId: string;
}

export function MaintenanceDecisionAction({
  maintenancePlanId,
}: MaintenanceDecisionActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextDue, setNextDue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await rescheduleMaintenance(maintenancePlanId, nextDue);
        setOpen(false);
        setNextDue('');
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível reagendar a manutenção.',
        );
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Reagendar manutenção
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Decisão necessária
      </div>

      <label
        htmlFor={`maintenance-next-due-${maintenancePlanId}`}
        className="mt-3 block text-sm font-medium text-slate-900"
      >
        Nova data
      </label>

      <input
        id={`maintenance-next-due-${maintenancePlanId}`}
        type="date"
        value={nextDue}
        onChange={(event) => setNextDue(event.target.value)}
        min={new Date().toISOString().split('T')[0]}
        required
        disabled={isPending}
        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {error && (
        <p className="mt-3 text-sm leading-5 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={isPending}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending || !nextDue}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'A guardar…' : 'Guardar nova data'}
        </button>
      </div>
    </form>
  );
}
