import { getIntelligenceEventBus } from "@/lib/intelligence-event-bus";

export default async function IntelligenceEventBusPage() {

  const bus = await getIntelligenceEventBus();

  return (

    <main className="p-8 space-y-6">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Event Bus
        </h1>

        <p className="mt-2 text-muted-foreground">
          Internal intelligence communication layer
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Event Bus Status
        </h2>

        <p className="mt-2">
          {bus.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Event Metrics
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">

          <p>
            Events: {bus.events}
          </p>

          <p>
            Publishers: {bus.publishers}
          </p>

          <p>
            Subscribers: {bus.subscribers}
          </p>

          <p>
            Processed: {bus.processed}
          </p>

        </div>

      </section>


    </main>

  );

}
