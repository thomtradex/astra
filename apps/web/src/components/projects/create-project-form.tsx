'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type CreateProjectFormProps = {
  customers: Array<{ id: string; name: string }>;
  sites: Array<{ id: string; name: string }>;
};

export function CreateProjectForm({
  customers,
  sites,
}: CreateProjectFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    customerId: '',
    siteId: '',
    status: 'PLANNING',
    progress: '0',
    budgetCents: '',
    startDate: '',
    endDate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          customerId: form.customerId || undefined,
          siteId: form.siteId || undefined,
          status: form.status,
          progress: Number(form.progress),
          budgetCents: form.budgetCents
            ? Math.round(Number(form.budgetCents) * 100)
            : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.message || 'Não foi possível criar a obra.',
        );
      }

      router.push('/projects');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a obra.',
      );
      setSubmitting(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Código</span>
          <input
            required
            value={form.code}
            onChange={(event) => update('code', event.target.value)}
            placeholder="OBR-001"
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Nome da obra</span>
          <input
            required
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Construção do empreendimento"
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Descrição</span>
          <textarea
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            rows={4}
            placeholder="Descrição da obra..."
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Cliente</span>
          <select
            value={form.customerId}
            onChange={(event) => update('customerId', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Sem cliente associado</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Local / obra</span>
          <select
            value={form.siteId}
            onChange={(event) => update('siteId', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Sem local associado</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Estado</span>
          <select
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="PLANNING">Planeamento</option>
            <option value="ACTIVE">Em execução</option>
            <option value="ON_HOLD">Em pausa</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Progresso (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(event) => update('progress', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Orçamento (€)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.budgetCents}
            onChange={(event) => update('budgetCents', event.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Data de início</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => update('startDate', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Data prevista de conclusão</span>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => update('endDate', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="rounded-xl border px-5 py-3 text-sm font-medium"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'A criar obra...' : 'Criar obra'}
        </button>
      </div>
    </form>
  );
}
