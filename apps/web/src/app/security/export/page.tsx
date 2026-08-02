import { getSecurityEvents } from '@/lib/security';

export default async function SecurityExportPage() {
  const events = await getSecurityEvents();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Security Export
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Export security activity and compliance data.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Export Ready
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Available security events: {events?.total ?? 0}
        </p>

        <button
          className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
          type="button"
        >
          Generate Export
        </button>
      </section>
    </main>
  );
}
