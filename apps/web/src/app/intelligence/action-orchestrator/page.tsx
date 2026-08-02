import { getActionOrchestrator } from "@/lib/intelligence-action-orchestrator";


export default async function ActionOrchestratorPage() {


  const orchestrator = await getActionOrchestrator();



  return (

    <main className="p-8">


      <h1 className="text-3xl font-bold">
        Action Orchestrator
      </h1>



      <section className="mt-8 grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Actions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestrator.actions}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Queued
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestrator.queued}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Executed
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestrator.executed}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orchestrator.status}
          </p>

        </div>


      </section>


    </main>

  );

}
