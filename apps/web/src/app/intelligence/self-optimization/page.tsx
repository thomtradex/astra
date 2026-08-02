import { getSelfOptimization } from "@/lib/intelligence-self-optimization";

export default async function SelfOptimizationPage() {

  const optimization = await getSelfOptimization();

  return (

    <main className="p-8 space-y-8">

      <section>

        <h1 className="text-3xl font-bold">
          Intelligence Self Optimization
        </h1>

        <p className="mt-2 text-muted-foreground">
          Autonomous optimization and continuous improvement layer.
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">

        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Optimizations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {optimization.optimizations}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Improvements
          </p>

          <p className="mt-2 text-3xl font-bold">
            {optimization.improvements}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Cycles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {optimization.cycles}
          </p>

        </div>


        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Efficiency
          </p>

          <p className="mt-2 text-3xl font-bold">
            {optimization.efficiency}%
          </p>

        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Optimization Status
        </h2>

        <p className="mt-2">
          {optimization.status}
        </p>

      </section>

    </main>

  );

}
