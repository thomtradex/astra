import { getRiskAssessments } from '@/lib/risk';

export default async function RiskAssessmentsPage() {
  const assessments = await getRiskAssessments();

  return (
    <main className="space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Risk Assessments
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Evaluate, track and manage administrative risk assessments.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Assessments
        </h2>

        {!assessments?.items.length ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No risk assessments available.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {assessments.items.map((assessment) => (
              <div
                key={assessment.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {assessment.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {assessment.status}
                </p>

                <p className="text-xs text-muted-foreground">
                  {assessment.updatedAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
