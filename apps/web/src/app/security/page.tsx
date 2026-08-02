import { getSecurityEvents } from '@/lib/security';

export default async function SecurityPage() {
  const events = await getSecurityEvents();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Security
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Security events and administrative activity.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6">
        {!events?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No security events found.
          </p>
        ) : (
          <div className="space-y-3">
            {events.items.map((event) => (
              <div
                key={event.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {event.action}
                </p>

                <p className="text-sm text-muted-foreground">
                  {event.resource}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
