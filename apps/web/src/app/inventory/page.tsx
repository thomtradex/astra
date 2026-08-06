import Link from 'next/link';

export default function InventoryPage(){

return(

<main className="p-6">

<div className="flex justify-between items-center mb-8">

<h1 className="text-3xl font-bold">
Inventory
</h1>

<Link
href="/inventory/new"
className="bg-black text-white px-4 py-2 rounded"
>

New Part

</Link>

</div>

<table className="w-full border">

<thead>

<tr className="bg-gray-100 border-b">

<th className="p-2 text-left">
Part
</th>

<th className="p-2 text-left">
SKU
</th>

<th className="p-2 text-left">
Stock
</th>

<th className="p-2 text-left">
Minimum
</th>

</tr>

</thead>

<tbody>

<tr className="border-b">

<td className="p-2">

<a
href="/inventory/test"
className="text-blue-600 hover:underline"
>

Oil Filter

</a>

</td>

<td className="p-2">
OF-001
</td>

<td className="p-2">
24
</td>

<td className="p-2">
5
</td>

</tr>

</tbody>

</table>

</main>

);

}
