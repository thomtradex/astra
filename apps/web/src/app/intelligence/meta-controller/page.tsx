import { getMetaController } from "@/lib/intelligence-meta-controller";

export default async function MetaControllerPage() {

  const controller = await getMetaController();

  return (

    <main className="space-y-6 p-8">

      <section className="rounded-lg border p-6">

        <h1 className="text-2xl font-bold">
          Astra Meta Intelligence Controller
        </h1>

        <p className="mt-2 text-muted-foreground">
          Central coordination layer for Astra intelligence systems.
        </p>

      </section>


      <section className="grid gap-4 md:grid-cols-4">

        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">
            Systems
          </h2>
          <p>{controller.systems}</p>
        </div>


        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">
            Signals
          </h2>
          <p>{controller.signals}</p>
        </div>


        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">
            Decisions
          </h2>
          <p>{controller.decisions}</p>
        </div>


        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">
            Coordination
          </h2>
          <p>{controller.coordination}</p>
        </div>

      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Controller Status
        </h2>

        <p className="mt-2">
          {controller.status}
        </p>

      </section>


    </main>

  );

}
