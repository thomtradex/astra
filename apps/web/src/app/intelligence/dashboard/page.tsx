import { getExecutiveMetrics } from '@/lib/intelligence';

export default async function ExecutiveDashboardPage() {
  const metrics = await getExecutiveMetrics();

  return (
    <main className="space-y-8 p-8">

      <header>
        <h1 className="text-3xl font-bold">
          Executive Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Executive operational metrics and intelligence overview.
        </p>
      </header>


      <section className="grid gap-4 md:grid-cols-4">

        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Users
          </p>
          <p className="mt-2 text-3xl font-bold">
            {metrics.users}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Risks
          </p>
          <p className="mt-2 text-3xl font-bold">
            {metrics.risks}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Signals
          </p>
          <p className="mt-2 text-3xl font-bold">
            {metrics.signals}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Compliance
          </p>
          <p className="mt-2 text-3xl font-bold">
            {metrics.compliance}%
          </p>
        </div>

      </section>

    </main>
  );
}
