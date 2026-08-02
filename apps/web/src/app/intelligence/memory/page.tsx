import { getIntelligenceMemory } from "@/lib/intelligence-memory";


export default async function IntelligenceMemoryPage() {

  const memory = await getIntelligenceMemory();


  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Astra Intelligence Memory
        </h1>

        <p className="text-muted-foreground mt-2">
          Operational memory and accumulated intelligence
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {memory.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Events
          </p>

          <p className="mt-2 text-3xl font-bold">
            {memory.events}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Patterns
          </p>

          <p className="mt-2 text-3xl font-bold">
            {memory.patterns}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Knowledge
          </p>

          <p className="mt-2 text-3xl font-bold">
            {memory.knowledge}
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
