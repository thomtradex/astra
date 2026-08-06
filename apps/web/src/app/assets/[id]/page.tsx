import Link from 'next/link';
import { getAsset } from '@/lib/assets.server';
import { deleteAssetAction } from './delete-action';

export default async function AssetDetail({
  params,
}:{
  params:Promise<{id:string}>
}){

  const {id}=await params;

  const asset=await getAsset(id);

  if(!asset){
    return(
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Asset not found
        </h1>
      </main>
    );
  }

  return(
    <main className="p-6 max-w-3xl">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          {asset.name}
        </h1>

        <div className="flex gap-3">

          <Link
            href={`/assets/${id}/edit`}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Edit
          </Link>

          <form action={deleteAssetAction.bind(null,id)}>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </form>

        </div>

      </div>

      <div className="space-y-4 border rounded p-6">

        <div>
          <strong>Code:</strong><br/>
          {asset.code}
        </div>

        <div>
          <strong>Status:</strong><br/>
          {asset.status}
        </div>

        <div>
          <strong>Serial Number:</strong><br/>
          {asset.serialNumber ?? '-'}
        </div>

      </div>

      <Link
        href="/assets"
        className="text-blue-600 block mt-8"
      >
        ← Back
      </Link>

    </main>
  );

}
