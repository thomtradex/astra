'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  assignWorkOrder,
  listAssignableUsers,
} from './actions/work-order-actions';

interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function WorkOrderDecisionAction({
  workOrderId,
}: {
  workOrderId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const result = await listAssignableUsers();

        if (active) {
          setUsers(result);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os responsáveis.');
        }
      } finally {
        if (active) {
          setLoadingUsers(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  function handleAssign() {
    if (!selectedUserId) {
      setError('Selecione um responsável.');
      return;
    }

    setError('');

    startTransition(async () => {
      try {
        await assignWorkOrder(workOrderId, selectedUserId);
        router.refresh();
      } catch {
        setError('Não foi possível atribuir a ordem de trabalho.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={selectedUserId}
        onChange={(event) => {
          setSelectedUserId(event.target.value);
          setError('');
        }}
        disabled={loadingUsers || isPending}
        className="min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
      >
        <option value="">
          {loadingUsers ? 'A carregar responsáveis…' : 'Escolher responsável'}
        </option>

        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName} — {user.email}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleAssign}
        disabled={!selectedUserId || loadingUsers || isPending}
        className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'A atribuir…' : 'Atribuir responsável'}
      </button>

      {error && (
        <p className="text-sm text-red-700 sm:ml-1">{error}</p>
      )}
    </div>
  );
}
