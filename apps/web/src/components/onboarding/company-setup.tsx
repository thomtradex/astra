'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CompanySetup() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [employees, setEmployees] = useState('');
  const [preference, setPreference] = useState('Operações');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: companyName.trim(),
          employees: employees ? Number(employees) : undefined,
          preference,
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível concluir a configuração. Tente novamente.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-7">
        <div>
          <h2 className="text-2xl font-semibold text-astra-950">
            Configure a sua empresa
          </h2>
          <p className="mt-2 text-slate-600">
            Estes dados ajudam a Astra a preparar a experiência inicial da sua operação.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-800">
            Nome da empresa
          </span>
          <input
            required
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Ex.: Construções Almeida"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-astra-700"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-800">
            Número de colaboradores
          </span>
          <input
            type="number"
            min="1"
            value={employees}
            onChange={(event) => setEmployees(event.target.value)}
            placeholder="Ex.: 12"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-astra-700"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-800">
            Principal prioridade
          </span>
          <select
            value={preference}
            onChange={(event) => setPreference(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-astra-700"
          >
            <option>Operações</option>
            <option>Gestão de ativos</option>
            <option>Manutenção</option>
            <option>Projetos</option>
            <option>Controlo e reporting</option>
          </select>
        </label>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-astra-950 px-5 py-3.5 font-medium text-white transition hover:bg-astra-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'A preparar a sua plataforma...' : 'Concluir configuração'}
        </button>
      </div>
    </form>
  );
}
