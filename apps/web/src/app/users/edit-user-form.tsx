'use client';

import { useState } from 'react';
import { updateUser } from '@/lib/users';

interface Props {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function EditUserForm({
  id,
  firstName,
  lastName,
  email,
}: Props) {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setLoading(true);

    await updateUser(id, {
      firstName: String(form.get('firstName')),
      lastName: String(form.get('lastName')),
      email: String(form.get('email')),
    });

    window.location.reload();
  }


  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded border px-3 py-1 text-sm"
      >
        Edit
      </button>
    );
  }


  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-2 rounded border p-3"
    >

      <input
        name="firstName"
        defaultValue={firstName}
        className="w-full rounded border p-2"
      />

      <input
        name="lastName"
        defaultValue={lastName}
        className="w-full rounded border p-2"
      />

      <input
        name="email"
        defaultValue={email}
        className="w-full rounded border p-2"
      />

      <button
        disabled={loading}
        className="rounded bg-primary px-3 py-1"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>

    </form>
  );
}
