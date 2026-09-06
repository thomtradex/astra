'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({
  projectId,
  projectName,
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);

        throw new Error(
          payload?.message || 'Não foi possível eliminar a obra.',
        );
      }

      router.push('/projects');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível eliminar a obra.',
      );
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Eliminar obra
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">
        Eliminar “{projectName}”?
      </p>

      <p className="mt-1 text-xs leading-5 text-red-700">
        Esta ação remove a obra e não pode ser desfeita.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={deleting}
          onClick={() => setConfirming(false)}
          className="rounded-xl border bg-white px-4 py-2 text-sm font-medium"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {deleting ? 'A eliminar...' : 'Confirmar eliminação'}
        </button>
      </div>
    </div>
  );
}
