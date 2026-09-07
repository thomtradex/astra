'use client';

import { useState } from 'react';

import { pauseProject } from './actions/project-actions';

interface ProjectDecisionActionProps {
  projectId: string;
}

export function ProjectDecisionAction({
  projectId,
}: ProjectDecisionActionProps) {
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePause() {
    setPending(true);
    setError(null);

    try {
      await pauseProject(projectId);
      setCompleted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível colocar o projeto em pausa.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handlePause}
        disabled={pending || completed}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? 'A colocar em pausa…'
          : completed
            ? 'Projeto colocado em pausa'
            : 'Colocar em pausa'}
      </button>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
