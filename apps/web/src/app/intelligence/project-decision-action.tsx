'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { pauseProject } from './actions/project-actions';

interface ProjectDecisionActionProps {
  projectId: string;
}

export function ProjectDecisionAction({ projectId }: ProjectDecisionActionProps) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handlePause() {
    setPending(true);
    setError(null);

    try {
      const outcome = await pauseProject(projectId);
      setConfirming(false);
      setCompleted(true);
      setSuccessMessage(outcome.message);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível colocar o projeto em pausa.',
      );
    } finally {
      setPending(false);
    }
  }

  if (completed) {
    return (
      <p className="text-sm font-medium text-emerald-700" role="status">
        {successMessage || 'Projeto colocado em pausa.'}
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-sm font-semibold text-slate-900">Confirmar pausa do projeto?</p>

        <p className="mt-1 text-sm leading-5 text-slate-600">
          O estado do projeto será alterado para “Em pausa”.
        </p>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={pending}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handlePause()}
            disabled={pending}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'A colocar em pausa…' : 'Confirmar pausa'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Colocar em pausa
      </button>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
