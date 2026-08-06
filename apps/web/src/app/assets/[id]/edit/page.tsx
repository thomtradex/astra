import Link from 'next/link';

import { getAsset } from '@/lib/assets.server';
import { updateAssetAction } from './actions';

export default async function EditAsset({
  params,
}:{
  params:Promise<{id:string}>
}){

  const {id}=await params;

  const asset=await getAsset(id);

  if(!asset){
    return(
      <main className="p-6">
        Asset not found
      </main>
    );
  }

  return(

    <main className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Edit Asset
      </h1>

      <form
        action={updateAssetAction.bind(null,id)}
        className="space-y-4"
      >

        <input
          name="code"
          defaultValue={asset.code}
          className="border p-2 w-full"
        />

        <input
          name="name"
          defaultValue={asset.name}
          className="border p-2 w-full"
        />

        <input
          name="serialNumber"
          defaultValue={asset.serialNumber ?? ''}
          className="border p-2 w-full"
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </form>

      <Link
        href={`/assets/${id}`}
        className="text-blue-600 block mt-8"
      >
        ← Back
      </Link>

    </main>

  );

}
