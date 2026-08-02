import { getAutonomousOperations } from "@/lib/intelligence-autonomous-operations";

export default async function AutonomousOperationsPage() {

  const operations = await getAutonomousOperations();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Autonomous Operations
        </h1>

        <p className="mt-2 text-muted-foreground">
          Operational autonomy layer powered by Astra intelligence.
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Operations
          </p>
          <p className="mt-2 text-3xl font-bold">
            {operations.operations}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Executions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {operations.executions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Approvals
          </p>
          <p className="mt-2 text-3xl font-bold">
            {operations.approvals}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Optimizations
          </p>
          <p className="mt-2 text-3xl font-bold">
            {operations.optimizations}
          </p>
        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Operations Status
        </h2>

        <p className="mt-2">
          {operations.status}
        </p>

      </section>

    </main>

  );

}
