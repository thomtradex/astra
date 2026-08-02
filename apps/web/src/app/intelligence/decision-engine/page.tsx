import { getDecisionEngine } from "@/lib/intelligence-decision-engine";

export default async function DecisionEnginePage() {

  const engine = await getDecisionEngine();

  return (

    <main className="p-8 space-y-6">

      <section>

        <h1 className="text-3xl font-bold">
          Astra Decision Engine
        </h1>

        <p className="mt-2 text-muted-foreground">
          Intelligence decision evaluation and recommendation layer.
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Decision Engine Metrics
        </h2>

        <div className="mt-4 space-y-2">

          <p>
            Decisions: {engine.decisions}
          </p>

          <p>
            Evaluations: {engine.evaluations}
          </p>

          <p>
            Confidence: {engine.confidence}
          </p>

          <p>
            Recommendations: {engine.recommendations}
          </p>

        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Decision Status
        </h2>

        <p className="mt-2">
          {engine.status}
        </p>

      </section>

    </main>

  );

}
