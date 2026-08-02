import { getAuditLogs } from '@/lib/audit';

export default async function AuditPage() {
  const audit = await getAuditLogs({
    limit: 50,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Audit
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          System activity, security events and user actions.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {!audit?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No audit events found.
          </p>
        ) : (
          <div className="space-y-3">
            {audit.items.map((item) => (
              <div
                key={item.id}
                className="rounded border p-4"
              >
                <div className="flex justify-between">
                  <p className="font-medium">
                    {item.action}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      item.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>

                <p className="mt-1 text-sm">
                  Resource: {item.resource}
                </p>

                {item.resourceId && (
                  <p className="text-sm text-muted-foreground">
                    ID: {item.resourceId}
                  </p>
                )}

                {item.actor && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Actor: {item.actor.firstName}{' '}
                    {item.actor.lastName}{' '}
                    ({item.actor.email})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
