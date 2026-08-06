import Link from 'next/link';

export default function TechniciansPage(){

return(

<main className="p-6">

<div className="flex justify-between items-center mb-8">

<h1 className="text-3xl font-bold">

Technicians

</h1>

<Link
href="/technicians/new"
className="bg-black text-white px-4 py-2 rounded"
>

New Technician

</Link>

</div>

<table className="w-full border">

<thead>

<tr className="bg-gray-100 border-b">

<th className="p-2 text-left">

Code

</th>

<th className="p-2 text-left">

Name

</th>

<th className="p-2 text-left">

Email

</th>

<th className="p-2 text-left">

Role

</th>

</tr>

</thead>

<tbody>

<tr className="border-b">

<td className="p-2">

TECH-001

</td>

<td className="p-2">

John Smith

</td>

<td className="p-2">

john@astra.com

</td>

<td className="p-2">

Electrician

</td>

</tr>

</tbody>

</table>

</main>

);

}
