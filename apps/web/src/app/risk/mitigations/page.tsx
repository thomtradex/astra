import { getRiskAssessments } from "@/lib/risk.server";

export default async function RiskMitigationsPage() {
  const assessments = await getRiskAssessments();

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">
          Risk Mitigations
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage mitigation plans and risk treatment actions.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Mitigation Console
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Available risks: {assessments?.items?.length ?? 0}
        </p>
      </section>
    </main>
  );
}
