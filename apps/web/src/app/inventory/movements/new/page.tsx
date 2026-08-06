import Link from 'next/link';

export default function NewMovement(){

return(

<main className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">

New Stock Movement

</h1>

<form className="space-y-4">

<input
placeholder="Part ID"
className="border p-2 w-full"
/>

<select
className="border p-2 w-full"
>

<option>IN</option>
<option>OUT</option>

</select>

<input
type="number"
placeholder="Quantity"
className="border p-2 w-full"
/>

<button
className="bg-black text-white px-4 py-2 rounded"
>

Save

</button>

</form>

<Link
href="/inventory/movements"
className="text-blue-600 block mt-6"
>

← Back

</Link>

</main>

);

}
