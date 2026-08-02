import { getIntelligenceInsights } from "@/lib/intelligence-insights";

export default async function IntelligenceInsightsPage() {
  const insights = await getIntelligenceInsights();

  return (
    <main className="p-8">
      <section>
        <h1 className="text-3xl font-semibold">
          Intelligence Insights
        </h1>

        <p className="mt-3 text-muted-foreground">
          Executive recommendations and operational intelligence.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Priority Insights
          </p>

          <p className="mt-2 text-3xl font-bold">
            {insights.priority}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Recommendations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {insights.recommendations}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Intelligence Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {insights.status}
          </p>
        </div>
      </section>
    </main>
  );
}
