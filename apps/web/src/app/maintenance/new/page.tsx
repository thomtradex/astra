import Link from 'next/link';

import { createMaintenancePlanAction } from './actions';

export default function NewMaintenancePlan() {
  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">
        New Preventive Maintenance Plan
      </h1>

      <form action={createMaintenancePlanAction} className="space-y-4">
        <input
          name="plan"
          placeholder="Plan"
          required
          className="border p-2 w-full"
        />

        <input
          name="assetId"
          placeholder="Asset ID"
          required
          className="border p-2 w-full"
        />

        <select
          name="frequency"
          required
          defaultValue="Monthly"
          className="border p-2 w-full"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>

        <input
          type="date"
          name="nextDue"
          required
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
        href="/maintenance"
        className="text-blue-600 block mt-6"
      >
        ← Back
      </Link>
    </main>
  );
}
