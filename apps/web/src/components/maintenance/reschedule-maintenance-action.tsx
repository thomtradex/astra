'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { rescheduleMaintenanceOperational } from '@/app/maintenance/actions/maintenance-actions';

interface RescheduleMaintenanceActionProps {
  maintenancePlanId: string;
  currentNextDue?: string;
  label?: string;
}

function toInputDate(value?: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
}

export function RescheduleMaintenanceAction({
  maintenancePlanId,
  currentNextDue,
  label = 'Alterar próxima intervenção',
}: RescheduleMaintenanceActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextDue, setNextDue] = useState(toInputDate(currentNextDue));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        if (!nextDue) {
          setError('Selecione uma nova data.');
          return;
        }

        await rescheduleMaintenanceOperational(
          maintenancePlanId,
          nextDue,
        );

        setSuccess('Próxima intervenção alterada com sucesso.');
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível alterar a próxima intervenção.',
        );
      }
    });
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setNextDue(toInputDate(currentNextDue));
            setOpen(true);
          }}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {label}
        </button>

        {success ? (
          <p className="text-sm font-medium text-emerald-700" role="status">
            {success}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Alterar próxima intervenção
      </p>

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

      {error ? (
        <p className="mt-3 text-sm leading-5 text-red-700">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setSuccess(null);
            setNextDue(toInputDate(currentNextDue));
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
          {isPending ? 'A guardar…' : 'Guardar alteração'}
        </button>
      </div>
    </form>
  );
}
