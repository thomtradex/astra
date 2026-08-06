import Link from 'next/link';
import { getAssets } from '@/lib/assets.server';

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">

<h1 className="text-2xl font-bold">
Assets
</h1>

<Link
href="/assets/new"
className="bg-black text-white px-4 py-2 rounded"
>
New Asset
</Link>

</div>

      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {assets.map(asset => (
            <tr key={asset.id} className="border-b">

              <td className="p-2">
                <Link
                  href={`/assets/${asset.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {asset.code}
                </Link>
              </td>

              <td className="p-2">
                {asset.name}
              </td>

              <td className="p-2">
                {asset.status}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
