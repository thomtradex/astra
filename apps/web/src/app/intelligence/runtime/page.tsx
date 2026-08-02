import { getIntelligenceRuntime } from "@/lib/intelligence-runtime";

export default async function IntelligenceRuntimePage() {

  const runtime = await getIntelligenceRuntime();

  return (

    <main className="p-8 space-y-6">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Runtime
        </h1>

        <p className="mt-2 text-muted-foreground">
          Autonomous intelligence execution layer
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Runtime Status
        </h2>

        <p className="mt-2">
          {runtime.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Runtime Metrics
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">

          <p>
            Cycles: {runtime.cycles}
          </p>

          <p>
            Executions: {runtime.executions}
          </p>

          <p>
            Events: {runtime.events}
          </p>

          <p>
            Decisions: {runtime.decisions}
          </p>

        </div>

      </section>

    </main>

  );

}
