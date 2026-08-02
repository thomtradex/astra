import { getIntelligenceOverview } from "@/lib/intelligence-overview";

export default async function IntelligenceOverviewPage() {
  const overview = await getIntelligenceOverview();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Intelligence Overview
      </h1>

      <section className="mt-8 grid gap-6 md:grid-cols-4">

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
            {overview.risks}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Actions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {overview.actions}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Status
          </p>
          <p className="mt-2 text-3xl font-bold">
            {overview.status}
          </p>
        </div>

      </section>
    </main>
  );
}
