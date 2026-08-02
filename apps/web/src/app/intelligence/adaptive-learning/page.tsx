import { getAdaptiveLearning } from "@/lib/intelligence-adaptive-learning";


export default async function AdaptiveLearningPage() {

  const learning = await getAdaptiveLearning();


  return (

    <main className="p-8 space-y-8">


      <section>

        <h1 className="text-3xl font-bold">
          Astra Adaptive Learning
        </h1>

        <p className="text-muted-foreground mt-2">
          Continuous improvement intelligence layer
        </p>

      </section>


      <section className="grid gap-6 md:grid-cols-4">


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Patterns
          </p>

          <p className="mt-2 text-3xl font-bold">
            {learning.patterns}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Improvements
          </p>

          <p className="mt-2 text-3xl font-bold">
            {learning.improvements}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Adaptations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {learning.adaptations}
          </p>
        </div>


        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Confidence
          </p>

          <p className="mt-2 text-3xl font-bold">
            {learning.confidence}
          </p>
        </div>


      </section>


      <section className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold">
          Learning Status
        </h2>

        <p className="mt-2">
          {learning.status}
        </p>

      </section>


    </main>

  );

}
