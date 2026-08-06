import Link from 'next/link';

import { getMaintenancePlans } from '@/lib/maintenance.server';

export default async function MaintenancePage() {
  const plans = await getMaintenancePlans();

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Preventive Maintenance
        </h1>

        <Link
          href="/maintenance/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          New Plan
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">Plan</th>
            <th className="p-2 text-left">Asset</th>
            <th className="p-2 text-left">Frequency</th>
            <th className="p-2 text-left">Next Due</th>
          </tr>
        </thead>

        <tbody>
          {plans?.map((plan) => (
            <tr
              key={plan.id}
              className="border-b"
            >
              <td className="p-2">{plan.plan}</td>
              <td className="p-2">{plan.assetId}</td>
              <td className="p-2">{plan.frequency}</td>
              <td className="p-2">
                {new Date(plan.nextDue).toLocaleDateString()}
              </td>
            </tr>
          ))}

          {!plans?.length && (
            <tr>
              <td
                colSpan={4}
                className="p-6 text-center text-gray-500"
              >
                No maintenance plans found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
