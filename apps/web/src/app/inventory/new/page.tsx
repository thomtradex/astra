import Link from 'next/link';

export default function NewPart(){

return(

<main className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">
New Part
</h1>

<form className="space-y-4">

<input
name="name"
placeholder="Part"
className="border p-2 w-full"
/>

<input
name="sku"
placeholder="SKU"
className="border p-2 w-full"
/>

<input
name="stock"
type="number"
placeholder="Stock"
className="border p-2 w-full"
/>

<input
name="minimum"
type="number"
placeholder="Minimum"
className="border p-2 w-full"
/>

<button
className="bg-black text-white px-4 py-2 rounded"
>

Save

</button>

</form>

<Link
href="/inventory"
className="text-blue-600 block mt-6"
>

← Back

</Link>

</main>

);

}
