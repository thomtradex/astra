import { getIntelligenceOverview } from "@/lib/intelligence-overview";
import { getIntelligenceCommandCenter } from "@/lib/intelligence-command-center";
import { getIntelligenceAudit } from "@/lib/intelligence-audit";

export default async function IntelligenceHubPage() {

  const overview = await getIntelligenceOverview();
  const command = await getIntelligenceCommandCenter();
  const audit = await getIntelligenceAudit();

  return (
    <main className="p-8 space-y-8">

      <h1 className="text-4xl font-bold">
        Intelligence Hub
      </h1>

      <section className="grid gap-6 md:grid-cols-3">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Signals
          </p>

          <p className="mt-2 text-3xl font-bold">
            {overview.signals}
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
            Governance Events
          </p>

          <p className="mt-2 text-3xl font-bold">
            {audit.events}
          </p>
        </div>


      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Intelligence Status
        </h2>

        <p className="mt-2">
          {overview.status}
        </p>

      </section>


    </main>
  );
}
