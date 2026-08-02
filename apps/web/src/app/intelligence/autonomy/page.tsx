import { getIntelligenceAutonomy } from "@/lib/intelligence-autonomy";

export default async function AutonomyPage() {

  const autonomy = await getIntelligenceAutonomy();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Intelligence Autonomy Engine
        </h1>

        <p className="mt-2">
          Autonomy status: {autonomy.status}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Autonomy Metrics
        </h2>

        <p>
          Tasks: {autonomy.tasks}
        </p>

        <p>
          Executions: {autonomy.executions}
        </p>

        <p>
          Automations: {autonomy.automations}
        </p>

        <p>
          Interventions: {autonomy.interventions}
        </p>

        <p>
          Autonomy Score: {autonomy.autonomyScore}
        </p>

      </section>

    </main>

  );

}
