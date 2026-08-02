import { getIntelligenceReasoning } from "@/lib/intelligence-reasoning";

export default async function ReasoningPage() {

  const reasoning = await getIntelligenceReasoning();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Intelligence Reasoning
        </h1>

        <p className="mt-2">
          Reasoning status: {reasoning.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Reasoning Metrics
        </h2>

        <p>
          Inferences: {reasoning.inferences}
        </p>

        <p>
          Analyses: {reasoning.analyses}
        </p>

        <p>
          Conclusions: {reasoning.conclusions}
        </p>

        <p>
          Explanations: {reasoning.explanations}
        </p>

        <p>
          Accuracy: {reasoning.accuracy}
        </p>

      </section>

    </main>

  );

}
