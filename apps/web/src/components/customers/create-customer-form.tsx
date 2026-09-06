'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateCustomerForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Não foi possível criar o cliente.';
        throw new Error(message);
      }

      router.push(`/customers/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o cliente.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-5">
          <div>
            <label htmlFor="code" className="text-sm font-medium">
              Código
            </label>
            <input
              id="code"
              required
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
              placeholder="CLI-001"
              className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Nome do cliente"
              className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="cliente@empresa.pt"
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="+351 ..."
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'A criar…' : 'Criar cliente'}
        </button>
      </div>
    </form>
  );
}
