import { getAutonomousRecommendations } from "@/lib/intelligence-autonomous-recommendations";


export default async function AutonomousRecommendationsPage() {

  const recommendations = await getAutonomousRecommendations();


  return (

    <main className="p-8">


      <h1 className="text-3xl font-bold">
        Autonomous Recommendations
      </h1>



      <section className="mt-8 grid gap-6 md:grid-cols-4">



        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Recommendations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.recommendations}
          </p>

        </div>




        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Priorities
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.priorities}
          </p>

        </div>




        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Confidence
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.confidence}
          </p>

        </div>




        <div className="rounded-lg border p-6">

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recommendations.status}
          </p>

        </div>



      </section>



    </main>

  );

}
