import { getIntelligenceDecisionEngine } from "@/lib/intelligence-decision-engine";

export default async function DecisionEnginePage() {

  const decision = await getIntelligenceDecisionEngine();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Intelligence Decision Engine
        </h1>

        <p className="mt-2">
          Decision status: {decision.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Decision Metrics
        </h2>

        <p>
          Decisions: {decision.decisions}
        </p>

        <p>
          Evaluations: {decision.evaluations}
        </p>

        <p>
          Priorities: {decision.priorities}
        </p>

        <p>
          Actions: {decision.actions}
        </p>

        <p>
          Confidence: {decision.confidence}
        </p>

      </section>

    </main>

  );

}
