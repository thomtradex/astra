export default function AuditPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Audit logs and activity history.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Audit Logs</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          This section will display system activity, user actions and security
          events.
        </p>
      </section>
    </main>
  );
}