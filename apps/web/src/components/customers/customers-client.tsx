'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Customer } from '@/lib/customers';

type Props = {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
};

export function CustomersClient({
  customers,
  total,
  page,
  totalPages,
  search,
}: Props) {
  const [value, setValue] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);

      if (value.trim()) {
        next.set('search', value.trim());
      } else {
        next.delete('search');
      }

      next.set('page', '1');

      window.location.href = `/customers?${next.toString()}`;
    }, 450);

    return () => clearTimeout(timeout);
  }, [value]);

  function navigate(nextPage: number) {
    const params = new URLSearchParams();

    if (value.trim()) {
      params.set('search', value.trim());
    }

    params.set('page', String(nextPage));

    window.location.href = `/customers?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {total} cliente{total === 1 ? '' : 's'}
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Novo cliente
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Pesquisar por nome, código, email ou telefone..."
          className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {customers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-5 py-4 text-left font-medium">Cliente</th>
                  <th className="px-5 py-4 text-left font-medium">Código</th>
                  <th className="px-5 py-4 text-left font-medium">Contacto</th>
                  <th className="px-5 py-4 text-left font-medium">Obras</th>
                  <th className="px-5 py-4 text-right font-medium">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {customer.code}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p>{customer.email || '—'}</p>
                        <p className="text-muted-foreground">
                          {customer.phone || '—'}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {customer.projects?.length ?? 0}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="font-medium">
              {search
                ? 'Nenhum cliente encontrado.'
                : 'Ainda não existem clientes.'}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? 'Experimente alterar os termos de pesquisa.'
                : 'Crie o primeiro cliente para começar.'}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => navigate(page - 1)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Anterior
          </button>

          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => navigate(page + 1)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Seguinte →
          </button>
        </div>
      )}
    </div>
  );
}
