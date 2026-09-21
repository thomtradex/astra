'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { assignWorkOrder, listAssignableUsers } from './actions/work-order-actions';

interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface WorkOrderDecisionActionProps {
  workOrderId: string;
}

export function WorkOrderDecisionAction({ workOrderId }: WorkOrderDecisionActionProps) {
  const router = useRouter();

  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const result = await listAssignableUsers();

        if (!active) {
          return;
        }

        setUsers(result);

        if (result.length === 0) {
          setError('Não existem utilizadores ativos disponíveis para atribuição.');
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
    setSuccess('');

    startTransition(async () => {
      try {
        const outcome = await assignWorkOrder(workOrderId, selectedUserId);

        setSuccess(outcome.message);
        setSelectedUserId('');

        router.refresh();
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : 'Não foi possível atribuir a ordem de trabalho.',
        );
      }
    });
  }

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Decisão operacional
        </p>

        <p className="text-sm font-semibold text-slate-900">Confirmar responsável</p>

        <p className="text-xs leading-5 text-slate-600">
          A Astra detetou uma ordem de alta prioridade sem responsável atribuído. Escolha quem deve
          assumir a execução.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium text-slate-700">Responsável</span>

          <select
            value={selectedUserId}
            onChange={(event) => {
              setSelectedUserId(event.target.value);
              setError('');
              setSuccess('');
            }}
            disabled={loadingUsers || isPending}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
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
        </label>

        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedUserId || loadingUsers || isPending}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'A atribuir…' : 'Confirmar atribuição'}
        </button>
      </div>

      {selectedUser ? (
        <p className="mt-2 text-xs text-slate-500">
          A decisão será registada para{' '}
          <span className="font-medium text-slate-700">
            {selectedUser.firstName} {selectedUser.lastName}
          </span>
          .
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
