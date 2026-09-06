import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { EditCustomerForm } from '@/components/customers/edit-customer-form';
import { getCustomer } from '@/lib/customers';

export default async function EditCustomerPage({
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
        <div>
          <Link
            href={`/customers/${customer.id}`}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← {customer.name}
          </Link>

          <div className="mt-3">
            <p className="text-sm font-medium text-muted-foreground">
              {customer.code}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Editar cliente
            </h1>
            <p className="mt-2 text-muted-foreground">
              Atualize os dados deste cliente.
            </p>
          </div>
        </div>

        <EditCustomerForm customer={customer} />
      </div>
    </DashboardShell>
  );
}
