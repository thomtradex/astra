import { getIntelligenceAudit } from "@/lib/intelligence-audit";

export default async function IntelligenceAuditPage() {
  const audit = await getIntelligenceAudit();

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold">
        Intelligence Audit
      </h1>

      <p className="mt-3 text-muted-foreground">
        Intelligence governance and operational traceability.
      </p>


      <section className="mt-8 grid gap-6 md:grid-cols-4">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Audit Events
          </p>

          <p className="mt-2 text-3xl font-bold">
            {audit.events}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Decisions Logged
          </p>

          <p className="mt-2 text-3xl font-bold">
            {audit.decisions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Actions Tracked
          </p>

          <p className="mt-2 text-3xl font-bold">
            {audit.actions}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Audit Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {audit.status}
          </p>
        </div>

      </section>

    </main>
  );
}
