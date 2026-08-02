import { getIntelligenceLearningEngine } from "@/lib/intelligence-learning-engine";

export default async function IntelligenceLearningEnginePage() {

  const learning = await getIntelligenceLearningEngine();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Intelligence Learning Engine
        </h1>

        <div className="mt-4 space-y-2">

          <p>
            Learnings: {learning.learnings}
          </p>

          <p>
            Patterns: {learning.patterns}
          </p>

          <p>
            Improvements: {learning.improvements}
          </p>

          <p>
            Adaptations: {learning.adaptations}
          </p>

        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Learning Status
        </h2>

        <p className="mt-2">
          {learning.status}
        </p>

      </section>

    </main>

  );

}
