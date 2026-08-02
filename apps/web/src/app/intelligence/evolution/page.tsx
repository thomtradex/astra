import { getIntelligenceEvolution } from "@/lib/intelligence-evolution";

export default async function IntelligenceEvolutionPage() {

  const evolution = await getIntelligenceEvolution();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-3xl font-bold">
          Astra Intelligence Evolution
        </h1>

        <p className="mt-2">
          Status: {evolution.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Evolution Metrics
        </h2>

        <p>
          Cycles: {evolution.cycles}
        </p>

        <p>
          Discoveries: {evolution.discoveries}
        </p>

        <p>
          Improvements: {evolution.improvements}
        </p>

        <p>
          Adaptations: {evolution.adaptations}
        </p>

        <p>
          Maturity Score: {evolution.maturityScore}
        </p>

      </section>

    </main>

  );

}
