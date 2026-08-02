import { getIntelligenceSelfImprovement } from "@/lib/intelligence-self-improvement";

export default async function SelfImprovementPage() {

  const improvement = await getIntelligenceSelfImprovement();

  return (

    <main className="p-8 space-y-6">

      <h1 className="text-3xl font-bold">
        Astra Self Improvement
      </h1>

      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Evolution Metrics
        </h2>

        <p className="mt-2">
          Improvements: {improvement.improvements}
        </p>

        <p>
          Optimizations: {improvement.optimizations}
        </p>

        <p>
          Upgrades: {improvement.upgrades}
        </p>

        <p>
          Refinements: {improvement.refinements}
        </p>

        <p>
          Evolution Score: {improvement.evolutionScore}
        </p>

      </section>

      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Self Improvement Status
        </h2>

        <p className="mt-2">
          {improvement.status}
        </p>

      </section>

    </main>

  );

}
