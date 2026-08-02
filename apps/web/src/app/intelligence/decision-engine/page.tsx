import { getDecisionEngine } from "@/lib/intelligence-decision-engine";

export default async function DecisionEnginePage() {

  const engine = await getDecisionEngine();

  return (
    <main className="p-8 space-y-8">

      <h1 className="text-4xl font-bold">
        Autonomous Decision Engine
      </h1>


      <section className="grid gap-6 md:grid-cols-4">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Confidence
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.confidence}%
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Automated
          </p>

          <p className="mt-2 text-3xl font-bold">
            {engine.automated}
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
