import Link from 'next/link';
import { getSite } from '@/lib/sites.server';
import { deleteSiteAction } from './delete-action';

export default async function SiteDetail({
  params,
}:{
  params:Promise<{id:string}>
}){

  const {id}=await params;

  const site=await getSite(id);

  if(!site){
    return(
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Site not found
        </h1>
      </main>
    );
  }

  return(
    <main className="p-6 max-w-3xl">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          {site.name}
        </h1>

        <div className="flex gap-3">

          <Link
            href={`/sites/${id}/edit`}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Edit
          </Link>

          <form action={deleteSiteAction}>

            <input
              type="hidden"
              name="id"
              value={id}
            />

            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>

          </form>

        </div>

      </div>

      <div className="border rounded p-6 space-y-4">

        <div>

          <strong>Code</strong><br/>

          {site.code}

        </div>

      </div>

      <Link
        href="/sites"
        className="text-blue-600 block mt-8"
      >
        ← Back
      </Link>

    </main>
  );

}
