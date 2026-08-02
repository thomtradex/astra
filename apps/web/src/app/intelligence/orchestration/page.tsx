import { getIntelligenceOrchestration } from "@/lib/intelligence-orchestration";

export default async function IntelligenceOrchestrationPage() {

  const orchestration = await getIntelligenceOrchestration();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Orchestration
        </h1>

        <p className="text-muted-foreground mt-2">
          Astra coordination and intelligence workflow layer.
        </p>

      </section>


      <section className="grid grid-cols-2 gap-6">

        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Modules
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestration.modules}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Workflows
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestration.workflows}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestration.decisions}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Coordination
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestration.coordination}
          </p>

        </div>


      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Orchestration Status
        </h2>

        <p className="mt-2">
          {orchestration.status}
        </p>

      </section>


    </main>

  );

}
