'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  customerId: string;
  customerName: string;
};

export function DeleteCustomerButton({
  customerId,
  customerName,
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setDeleting(true);

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Não foi possível eliminar o cliente.';

        throw new Error(message);
      }

      router.push('/customers');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível eliminar o cliente.',
      );
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
        >
          Eliminar cliente
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <p className="font-medium">Eliminar {customerName}?</p>

      <p className="mt-1 text-sm text-muted-foreground">
        Esta ação remove o cliente da sua organização e não pode ser desfeita.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={deleting}
          onClick={() => setConfirming(false)}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {deleting ? 'A eliminar…' : 'Confirmar eliminação'}
        </button>
      </div>
    </div>
  );
}
