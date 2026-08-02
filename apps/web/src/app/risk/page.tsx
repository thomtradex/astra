import { getRiskAssessments } from '@/lib/risk';

export default async function RiskDashboardPage() {
  const assessments = await getRiskAssessments();

  const total = assessments?.total ?? 0;

  return (
    <main className="space-y-8 p-8">

      <header>
        <h1 className="text-3xl font-bold">
          Risk Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Executive overview of administrative risk posture.
        </p>
      </header>


      <section className="grid gap-4 md:grid-cols-4">

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Assessments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {total}
          </p>
        </div>


        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Mitigations
          </p>

          <p className="mt-2 text-3xl font-bold">
            Ready
          </p>
        </div>


        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Controls
          </p>

          <p className="mt-2 text-3xl font-bold">
            Ready
          </p>
        </div>


        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            Ready
          </p>
        </div>

      </section>


      <section className="rounded-xl border bg-card p-6">

        <h2 className="text-lg font-semibold">
          Risk Operations
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Risk lifecycle management is operational.
        </p>

      </section>

    </main>
  );
}
