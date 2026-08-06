import Link from 'next/link';

import {createAssetAction} from './actions';

export default function NewAssetPage() {
  return (
    <main className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        New Asset
      </h1>

      <form action={createAssetAction} className="space-y-4">

        <input
          className="border p-2 w-full"
          name="code" placeholder="Code"
        />

        <input
          className="border p-2 w-full"
          name="name" placeholder="Name"
        />

        <input
          className="border p-2 w-full"
          name="serialNumber" placeholder="Serial Number"
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </form>

      <Link
        href="/assets"
        className="text-blue-600 block mt-6"
      >
        ← Back
      </Link>

    </main>
  );
}
