import Link from 'next/link';

import { getCustomers } from '@/lib/customers.server';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Customers
        </h1>

        <Link
          href="/customers/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          New Customer
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Phone</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="border-b"
            >
              <td className="p-2">
                {customer.code}
              </td>

              <td className="p-2">
                {customer.name}
              </td>

              <td className="p-2">
                {customer.email ?? '—'}
              </td>

              <td className="p-2">
                {customer.phone ?? '—'}
              </td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-6 text-center text-astra-500"
              >
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
