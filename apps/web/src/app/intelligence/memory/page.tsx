import { getIntelligenceMemory } from "@/lib/intelligence-memory";

export default async function IntelligenceMemoryPage() {

  const memory = await getIntelligenceMemory();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Intelligence Memory
        </h1>

        <div className="mt-4 space-y-2">

          <p>
            Memories: {memory.memories}
          </p>

          <p>
            Contexts: {memory.contexts}
          </p>

          <p>
            Patterns: {memory.patterns}
          </p>

          <p>
            Recalls: {memory.recalls}
          </p>

        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Memory Status
        </h2>

        <p className="mt-2">
          {memory.status}
        </p>

      </section>

    </main>

  );

}
