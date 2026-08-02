import { getIntelligenceGovernance } from "@/lib/intelligence-governance";

export default async function GovernancePage() {

  const governance = await getIntelligenceGovernance();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Governance
        </h1>

        <p className="mt-2 text-muted-foreground">
          Governance, safety and control layer for autonomous intelligence.
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Policies
          </p>
          <p className="mt-2 text-3xl font-bold">
            {governance.policies}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Approvals
          </p>
          <p className="mt-2 text-3xl font-bold">
            {governance.approvals}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Audits
          </p>
          <p className="mt-2 text-3xl font-bold">
            {governance.audits}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Violations
          </p>
          <p className="mt-2 text-3xl font-bold">
            {governance.violations}
          </p>
        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Governance Status
        </h2>

        <p className="mt-2">
          {governance.status}
        </p>

      </section>

    </main>

  );

}
