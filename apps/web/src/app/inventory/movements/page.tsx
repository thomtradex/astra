import Link from 'next/link';

export default function StockMovements(){

return(

<main className="p-6">

<div className="flex justify-between items-center mb-8">

<h1 className="text-3xl font-bold">

Stock Movements

</h1>

<Link
href="/inventory/movements/new"
className="bg-black text-white px-4 py-2 rounded"
>

New Movement

</Link>

</div>

<table className="w-full border">

<thead>

<tr className="bg-gray-100 border-b">

<th className="p-2 text-left">

Date

</th>

<th className="p-2 text-left">

Part

</th>

<th className="p-2 text-left">

Type

</th>

<th className="p-2 text-left">

Quantity

</th>

</tr>

</thead>

<tbody>

<tr className="border-b">

<td className="p-2">

05/08/2026

</td>

<td className="p-2">

Oil Filter

</td>

<td className="p-2">

IN

</td>

<td className="p-2">

+24

</td>

</tr>

</tbody>

</table>

</main>

);

}
