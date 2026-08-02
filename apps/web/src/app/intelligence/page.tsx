import { getIntelligenceOverview } from '@/lib/intelligence';

export default async function IntelligencePage() {
  const overview = await getIntelligenceOverview();

  return (
    <main className="space-y-8 p-8">

      <header>
        <h1 className="text-3xl font-bold">
          Intelligence Center
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Operational intelligence and administrative insights.
        </p>
      </header>


      <section className="rounded-xl border border-border bg-card p-6">

        <h2 className="text-lg font-semibold">
          Overview
        </h2>


        <div className="mt-4 space-y-2">

          <p className="text-sm">
            Active signals:
            {' '}
            {overview?.signals ?? 0}
          </p>


          <p className="text-sm">
            Risk indicators:
            {' '}
            {overview?.risks ?? 0}
          </p>


          <p className="text-sm">
            Intelligence layer ready.
          </p>

        </div>

      </section>

    </main>
  );
}
