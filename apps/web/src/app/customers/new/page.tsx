import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CreateCustomerForm } from '@/components/customers/create-customer-form';

export default function NewCustomerPage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <Link
            href="/customers"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Clientes
          </Link>

          <div className="mt-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Novo cliente
            </h1>
            <p className="mt-2 text-muted-foreground">
              Adicione um cliente à carteira da sua empresa.
            </p>
          </div>
        </div>

        <CreateCustomerForm />
      </div>
    </DashboardShell>
  );
}
