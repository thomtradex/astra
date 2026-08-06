import Link from 'next/link';
import { createSiteAction } from './actions';

export default function NewSitePage() {
  return (
    <main className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        New Site
      </h1>

      <form action={createSiteAction} className="space-y-4">

        <input
          className="border p-2 w-full"
          name="code"
          placeholder="Code"
        />

        <input
          className="border p-2 w-full"
          name="name"
          placeholder="Name"
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </form>

      <Link
        href="/sites"
        className="text-blue-600 block mt-6"
      >
        ← Back
      </Link>

    </main>
  );
}
