import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CustomersClient } from '@/components/customers/customers-client';
import { getCustomers } from '@/lib/customers';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  const response = await getCustomers(search, {
    page,
    limit: 25,
  });

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-2 text-muted-foreground">
            Gestão centralizada da carteira de clientes.
          </p>
        </div>

        <CustomersClient
          customers={response.items}
          total={response.pagination.total}
          page={response.pagination.page}
          totalPages={response.pagination.totalPages}
          search={search}
        />
      </div>
    </DashboardShell>
  );
}
