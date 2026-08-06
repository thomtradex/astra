import Link from 'next/link';

import { getSite } from '@/lib/sites.server';

import { updateSiteAction } from './actions';

export default async function EditSitePage({
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

    <main className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Edit Site
      </h1>

      <form
        action={updateSiteAction.bind(null,id)}
        className="space-y-4"
      >

        <input
          name="code"
          defaultValue={site.code}
          className="border p-2 w-full"
        />

        <input
          name="name"
          defaultValue={site.name}
          className="border p-2 w-full"
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </form>

      <Link
        href={`/sites/${id}`}
        className="text-blue-600 block mt-6"
      >
        ← Back
      </Link>

    </main>

  );

}
