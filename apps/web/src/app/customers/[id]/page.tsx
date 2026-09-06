import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getCustomer } from '@/lib/customers';
import { DeleteCustomerButton } from '@/components/customers/delete-customer-button';

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/customers"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              ← Clientes
            </Link>

            <div className="mt-3">
              <p className="text-sm font-medium text-muted-foreground">
                {customer.code}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {customer.name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Informação e atividade operacional do cliente.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Editar
            </Link>

            <Link
              href={`/projects/new?customerId=${customer.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Nova obra
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Código</p>
            <p className="mt-2 font-semibold">{customer.code}</p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-2 font-semibold">{customer.email || '—'}</p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p className="mt-2 font-semibold">{customer.phone || '—'}</p>
          </div>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Obras deste cliente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Relação real entre cliente e obras.
            </p>
          </div>

          <div className="divide-y">
            {customer.projects?.length ? (
              customer.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-4 p-6 transition hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project.code}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">{project.status}</p>
                    {'progress' in project && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.progress}% concluído
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="font-medium">Ainda não existem obras associadas.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie uma obra para começar a acompanhar a operação deste cliente.
                </p>
                <Link
                  href={`/projects/new?customerId=${customer.id}`}
                  className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Criar obra
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Zona de segurança</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ações permanentes sobre este cliente.
          </p>
          <div className="mt-4">
            <DeleteCustomerButton
              customerId={customer.id}
              customerName={customer.name}
            />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Informação do registo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="mt-1 font-medium">{formatDate(customer.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizado em</p>
              <p className="mt-1 font-medium">{formatDate(customer.updated_at)}</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
