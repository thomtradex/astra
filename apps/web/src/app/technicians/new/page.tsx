import Link from 'next/link';

export default function NewTechnician(){

return(

<main className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">

New Technician

</h1>

<form className="space-y-4">

<input
placeholder="Code"
className="border p-2 w-full"
/>

<input
placeholder="Name"
className="border p-2 w-full"
/>

<input
placeholder="Email"
className="border p-2 w-full"
/>

<input
placeholder="Role"
className="border p-2 w-full"
/>

<button
className="bg-black text-white px-4 py-2 rounded"
>

Save

</button>

</form>

<Link
href="/technicians"
className="text-blue-600 block mt-6"
>

← Back

</Link>

</main>

);

}
