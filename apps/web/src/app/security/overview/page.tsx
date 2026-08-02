import { getSecurityEvents } from '@/lib/security';

export default async function SecurityOverviewPage() {
  const events = await getSecurityEvents();

  const total = events?.total ?? 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-8">

      <header>
        <h1 className="text-3xl font-bold">
          Security Overview
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Security events and system protection overview.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">
          Security Events
        </h2>

        <p className="mt-3 text-3xl font-bold">
          {total}
        </p>

        <p className="text-sm text-muted-foreground">
          Recorded security events
        </p>
      </section>

    </main>
  );
}
