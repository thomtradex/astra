import Link from 'next/link';
import { getSites } from '@/lib/sites.server';

export default async function SitesPage() {
  const sites = await getSites();

  return (
    <main className="p-6">
      
<div className="flex justify-between items-center mb-6">

<h1 className="text-2xl font-bold">
Sites
</h1>

<Link
href="/sites/new"
className="bg-black text-white px-4 py-2 rounded"
>
New Site
</Link>

</div>


      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">City</th>
          </tr>
        </thead>

        <tbody>
          {sites.map(site => (
            <tr key={site.id} className="border-b">
              <td className="p-2">
<Link
href={`/sites/${site.id}`}
className="text-blue-600 hover:underline"
>
{site.code}
</Link>
</td>
              <td className="p-2">{site.name}</td>
              <td className="p-2">{site.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
