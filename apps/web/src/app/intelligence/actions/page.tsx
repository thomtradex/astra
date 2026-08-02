import { getIntelligenceActions } from "@/lib/intelligence-actions";

export default async function IntelligenceActionsPage() {
  const actions = await getIntelligenceActions();

  return (
    <main className="p-8">
      <section>
        <h1 className="text-3xl font-bold">
          Intelligence Actions
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Action orchestration and intelligence execution layer.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Pending Actions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {actions.pending}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Executed Actions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {actions.executed}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Intelligence Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {actions.status}
          </p>
        </div>

      </section>
    </main>
  );
}
