import { getFeedbackLoop } from "@/lib/intelligence-feedback-loop";

export default async function FeedbackLoopPage() {

  const loop = await getFeedbackLoop();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-4xl font-bold">
          Autonomous Feedback Loop
        </h1>

        <p className="mt-2 text-muted-foreground">
          Continuous learning and execution improvement cycle.
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Executions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loop.executions}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Outcomes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loop.outcomes}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Improvements
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loop.improvements}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loop.status}
          </p>

        </div>


      </section>

    </main>

  );

}
