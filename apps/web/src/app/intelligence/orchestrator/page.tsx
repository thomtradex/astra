import { getIntelligenceOrchestrator } from "@/lib/intelligence-orchestrator";

export default async function IntelligenceOrchestratorPage() {

  const orchestrator = await getIntelligenceOrchestrator();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-3xl font-bold">
          Intelligence Orchestrator
        </h1>

        <p className="mt-2">
          Status: {orchestrator.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Orchestration Metrics
        </h2>

        <p>
          Systems: {orchestrator.systems}
        </p>

        <p>
          Coordinated Actions: {orchestrator.coordinatedActions}
        </p>

        <p>
          Workflows: {orchestrator.workflows}
        </p>

        <p>
          Decisions: {orchestrator.decisions}
        </p>

        <p>
          Executions: {orchestrator.executions}
        </p>

      </section>

    </main>

  );

}
