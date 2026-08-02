import { getGovernancePolicies } from '@/lib/governance';

export default async function GovernancePoliciesPage() {
  const policies = await getGovernancePolicies();

  return (
    <main className="p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Governance Policies
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage administrative policies and compliance rules.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Policies
        </h2>

        {!policies?.items?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No governance policies configured.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {policies.items.map((policy) => (
              <div
                key={policy.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {policy.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {policy.status}
                </p>

                <p className="text-xs text-muted-foreground">
                  {policy.updatedAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
