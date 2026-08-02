import { getIntelligenceCognitiveEngine } from "@/lib/intelligence-cognitive-engine";

export default async function CognitiveEnginePage() {

  const cognitive = await getIntelligenceCognitiveEngine();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Cognitive Engine
        </h1>

        <p className="mt-2">
          Cognitive intelligence layer status:
          {cognitive.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Cognitive Metrics
        </h2>

        <p>
          Thoughts: {cognitive.thoughts}
        </p>

        <p>
          Reasoning: {cognitive.reasoning}
        </p>

        <p>
          Hypotheses: {cognitive.hypotheses}
        </p>

        <p>
          Validations: {cognitive.validations}
        </p>

        <p>
          Confidence: {cognitive.confidence}
        </p>

      </section>

    </main>

  );

}
