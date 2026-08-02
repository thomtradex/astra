import { getRiskAssessments } from "@/lib/risk";

export default async function RiskReportsPage() {
  const assessments = await getRiskAssessments();

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">
          Risk Reports
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review risk summaries, trends and reporting insights.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Reporting Console
        </h2>

        <div className="mt-4 space-y-2">
          <p className="text-sm">
            Total assessments:
            {" "}
            {assessments?.total ?? 0}
          </p>

          <p className="text-sm text-muted-foreground">
            Reporting pipeline ready.
          </p>
        </div>
      </section>
    </main>
  );
}
