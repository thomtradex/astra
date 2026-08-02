import { getIntelligenceTimeline } from "@/lib/intelligence-timeline";

export default async function IntelligenceTimelinePage() {
  const timeline = await getIntelligenceTimeline();

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold">
        Intelligence Timeline
      </h1>

      <p className="mt-3 text-muted-foreground">
        Intelligence event history and operational evolution.
      </p>


      <section className="mt-8 grid gap-6 md:grid-cols-3">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Events
          </p>

          <p className="mt-2 text-3xl font-bold">
            {timeline.events}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {timeline.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Intelligence Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {timeline.status}
          </p>
        </div>

      </section>

    </main>
  );
}
