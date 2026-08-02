import { getIntelligenceCore } from "@/lib/intelligence-core";

export default async function IntelligenceCorePage() {

  const core = await getIntelligenceCore();

  return (

    <main className="p-8 space-y-6">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Core
        </h1>

        <p className="mt-2 text-muted-foreground">
          Central intelligence coordination layer
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Core Status
        </h2>

        <p className="mt-2">
          {core.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Intelligence Metrics
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">

          <p>
            Modules: {core.modules}
          </p>

          <p>
            Memories: {core.memories}
          </p>

          <p>
            Decisions: {core.decisions}
          </p>

          <p>
            Optimizations: {core.optimizations}
          </p>

          <p>
            Governance: {core.governance}
          </p>

        </div>

      </section>


    </main>

  );

}
