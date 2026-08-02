import { getDecisionContext } from "@/lib/intelligence-decision-context";

export default async function DecisionContextPage() {

  const context = await getDecisionContext();

  return (
    <main className="p-8 space-y-8">

      <h1 className="text-3xl font-bold">
        Intelligence Decision Context
      </h1>


      <section className="grid grid-cols-3 gap-6">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Signals
          </p>
          <p className="mt-2 text-3xl font-bold">
            {context.signals}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Risks
          </p>
          <p className="mt-2 text-3xl font-bold">
            {context.risks}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Status
          </p>
          <p className="mt-2 text-3xl font-bold">
            {context.status}
          </p>
        </div>


      </section>

    </main>
  );
}
