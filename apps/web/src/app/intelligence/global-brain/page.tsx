import { getIntelligenceGlobalBrain } from "@/lib/intelligence-global-brain";

export default async function IntelligenceGlobalBrainPage() {

  const brain = await getIntelligenceGlobalBrain();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Global Brain
        </h1>

        <div className="mt-4 space-y-2">

          <p>
            Memories: {brain.memories}
          </p>

          <p>
            Learnings: {brain.learnings}
          </p>

          <p>
            Decisions: {brain.decisions}
          </p>

          <p>
            Executions: {brain.executions}
          </p>

          <p>
            Adaptations: {brain.adaptations}
          </p>

        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Brain Status
        </h2>

        <p className="mt-2">
          {brain.status}
        </p>

      </section>

    </main>

  );

}
