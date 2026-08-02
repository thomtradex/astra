import { getIntelligenceControlPlane } from "@/lib/intelligence-control-plane";

export default async function IntelligenceControlPlanePage() {

  const control = await getIntelligenceControlPlane();

  return (

    <main className="p-8 space-y-6">

      <section className="rounded-lg border p-6">

        <h1 className="text-3xl font-bold">
          Astra Intelligence Control Plane
        </h1>

        <p className="mt-2">
          Health: {control.health}
        </p>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Global Intelligence Metrics
        </h2>

        <p>
          Systems: {control.systems}
        </p>

        <p>
          Active Modules: {control.activeModules}
        </p>

        <p>
          Decisions: {control.decisions}
        </p>

        <p>
          Executions: {control.executions}
        </p>

        <p>
          Improvements: {control.improvements}
        </p>

        <p>
          Evolution: {control.evolution}
        </p>

      </section>

    </main>

  );

}
