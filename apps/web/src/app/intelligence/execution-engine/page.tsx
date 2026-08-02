import { getExecutionEngine } from "@/lib/intelligence-execution-engine";


export default async function ExecutionEnginePage() {


  const engine = await getExecutionEngine();



  return (

    <main className="p-8">


      <h1 className="text-3xl font-bold">
        Execution Engine
      </h1>



      <section className="mt-8 grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Executions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.executions}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Queued
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.queued}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.completed}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.status}
          </p>

        </div>



      </section>


    </main>

  );

}
