import { getRiskAssessments } from "@/lib/risk";

export default async function RiskControlsPage() {
  const assessments = await getRiskAssessments();

  return (
    <main className="space-y-6 p-6">

      <header>
        <h1 className="text-2xl font-bold">
          Risk Controls
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage preventive, detective and corrective controls.
        </p>
      </header>


      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

        <h2 className="text-lg font-semibold">
          Controls Console
        </h2>


        <p className="mt-3 text-sm text-muted-foreground">
          Connected assessments:
          {" "}
          {assessments?.items?.length ?? 0}
        </p>


        <div className="mt-4 rounded border p-4">
          <p className="font-medium">
            Control framework
          </p>

          <p className="text-sm text-muted-foreground">
            Control lifecycle management ready.
          </p>
        </div>

      </section>

    </main>
  );
}
