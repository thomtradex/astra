import { getSessions } from '@/lib/security';

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Active Sessions
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Monitor administrator sessions.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6">
        {!sessions?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No sessions found.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.items.map((session) => (
              <div
                key={session.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {session.userEmail}
                </p>

                <p className="text-sm text-muted-foreground">
                  {session.ipAddress}
                </p>

                <p className="text-xs text-muted-foreground">
                  {session.createdAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
