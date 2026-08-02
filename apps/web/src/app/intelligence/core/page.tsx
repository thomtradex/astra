import { getIntelligenceCore } from "@/lib/intelligence-core";

export default async function IntelligenceCorePage() {

  const core = await getIntelligenceCore();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Astra Intelligence Core
        </h1>

        <p className="text-muted-foreground mt-2">
          Autonomous intelligence operating layer
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Modules
          </p>
          <p className="mt-2 text-3xl font-bold">
            {core.modules}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {core.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Actions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {core.actions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Learning
          </p>
          <p className="mt-2 text-3xl font-bold">
            {core.learning}
          </p>
        </div>


      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Intelligence Status
        </h2>

        <p className="mt-2">
          {core.status}
        </p>

      </section>


    </main>

  );

}
