import { getIntelligenceRecommendations } from "@/lib/intelligence-recommendations";

export default async function IntelligenceRecommendationsPage() {
  const recommendations = await getIntelligenceRecommendations();

  return (
    <main className="p-8">

      <section>
        <h1 className="text-3xl font-bold">
          Intelligence Recommendations
        </h1>

        <p className="mt-2 text-muted-foreground">
          Actionable recommendations generated from intelligence signals.
        </p>
      </section>


      <section className="mt-8 grid gap-6 md:grid-cols-3">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Open Recommendations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.open}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Priority Actions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.priority}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Intelligence State
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.status}
          </p>
        </div>

      </section>

    </main>
  );
}
