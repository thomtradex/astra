'use client';

import { useState } from 'react';
import { createUser } from '@/lib/users';

export default function CreateUserForm() {
  const [loading, setLoading] = useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setLoading(true);

    await createUser({
      firstName: String(form.get('firstName')),
      lastName: String(form.get('lastName')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    });

    window.location.reload();
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 space-y-3 rounded border p-4"
    >
      <input
        name="firstName"
        placeholder="First name"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="lastName"
        placeholder="Last name"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="email"
        placeholder="Email"
        type="email"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="password"
        placeholder="Password"
        type="password"
        className="w-full rounded border p-2"
        required
      />

      <button
        disabled={loading}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        {loading ? 'Creating...' : 'Create user'}
      </button>
    </form>
  );
}
