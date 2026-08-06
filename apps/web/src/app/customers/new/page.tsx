import Link from 'next/link';

import { createCustomerAction } from './actions';

export default function NewCustomerPage() {
  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">
        New Customer
      </h1>

      <form
        action={createCustomerAction}
        className="space-y-4"
      >
        <input
          name="code"
          placeholder="Code"
          required
          className="border p-2 w-full"
        />

        <input
          name="name"
          placeholder="Customer"
          required
          className="border p-2 w-full"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
        />

        <input
          name="phone"
          placeholder="Phone"
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </form>

      <Link
        href="/customers"
        className="text-blue-600 block mt-6"
      >
        ← Back
      </Link>
    </main>
  );
}
