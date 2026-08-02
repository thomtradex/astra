import { getIntelligenceCommandCenter } from "@/lib/intelligence-command-center";

export default async function IntelligenceCommandCenterPage() {
  const command = await getIntelligenceCommandCenter();

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold">
        Intelligence Command Center
      </h1>

      <p className="mt-3 text-muted-foreground">
        Executive operational intelligence overview.
      </p>


      <section className="mt-8 grid gap-6 md:grid-cols-5">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Signals
          </p>

          <p className="mt-2 text-3xl font-bold">
            {command.signals}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Risks
          </p>

          <p className="mt-2 text-3xl font-bold">
            {command.risks}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Actions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {command.actions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {command.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {command.status}
          </p>
        </div>

      </section>

    </main>
  );
}
