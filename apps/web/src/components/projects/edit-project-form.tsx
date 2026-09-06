'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Project = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  progress: number;
  budget_cents?: number | null;
  start_date?: string | null;
  end_date?: string | null;
};

type EditProjectFormProps = {
  project: Project;
};

function dateInput(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function EditProjectForm({
  project,
}: EditProjectFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    code: project.code,
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    progress: String(project.progress),
    budget: project.budget_cents != null
      ? String(project.budget_cents / 100)
      : '',
    startDate: dateInput(project.start_date),
    endDate: dateInput(project.end_date),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          progress: Number(form.progress),
          budgetCents: form.budget
            ? Math.round(Number(form.budget) * 100)
            : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.message || 'Não foi possível atualizar a obra.',
        );
      }

      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a obra.',
      );
      setSaving(false);
    }
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
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Nome da obra</span>
          <input
            required
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Descrição</span>
          <textarea
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            rows={4}
            className="w-full rounded-xl border px-4 py-3"
          />
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
            value={form.budget}
            onChange={(event) => update('budget', event.target.value)}
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
          <span className="text-sm font-medium">
            Data prevista de conclusão
          </span>
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

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(`/projects/${project.id}`)}
          className="rounded-xl border px-5 py-3 text-sm font-medium"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'A guardar...' : 'Guardar alterações'}
        </button>
      </div>
    </form>
  );
}
