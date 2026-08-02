import { getIntelligenceGovernance } from "@/lib/intelligence-governance";

export default async function IntelligenceGovernancePage() {
  const governance = await getIntelligenceGovernance();

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold">
        Intelligence Governance Center
      </h1>

      <p className="mt-3 text-muted-foreground">
        Central intelligence control and governance operations.
      </p>


      <section className="mt-8 grid gap-6 md:grid-cols-4">

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
            Controls
          </p>

          <p className="mt-2 text-3xl font-bold">
            {governance.controls}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Reviews
          </p>

          <p className="mt-2 text-3xl font-bold">
            {governance.reviews}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Governance Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {governance.status}
          </p>
        </div>

      </section>

    </main>
  );
}
