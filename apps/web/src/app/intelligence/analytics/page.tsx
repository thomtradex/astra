import { getAnalyticsOverview } from '@/lib/intelligence-analytics';

export default async function IntelligenceAnalyticsPage() {
  const analytics = await getAnalyticsOverview();

  return (
    <main className="space-y-8 p-8">

      <header>
        <h1 className="text-3xl font-bold">
          Intelligence Analytics
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Analytics trends and operational intelligence insights.
        </p>
      </header>


      <section className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Risk Trend
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analytics.riskTrend}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Active Signals
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analytics.activeSignals}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Intelligence Score
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analytics.score}
          </p>
        </div>

      </section>

    </main>
  );
}
