import { getDecisionIntelligence } from "@/lib/intelligence-decision-intelligence";


export default async function DecisionIntelligencePage() {

  const intelligence = await getDecisionIntelligence();


  return (

    <main className="p-8">

      <h1 className="text-3xl font-bold">
        Decision Intelligence
      </h1>


      <section className="mt-8 grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Signals
          </p>

          <p className="mt-2 text-3xl font-bold">
            {intelligence.signals}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Recommendations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {intelligence.recommendations}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Confidence
          </p>

          <p className="mt-2 text-3xl font-bold">
            {intelligence.confidence}
          </p>

        </div>



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {intelligence.decisions}
          </p>

        </div>


      </section>



      <section className="mt-8 rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Intelligence Status
        </h2>


        <p className="mt-2">
          {intelligence.status}
        </p>


      </section>


    </main>

  );

}
