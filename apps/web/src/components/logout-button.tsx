'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { logout } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logout();
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-lg border border-astra-200 px-4 py-2 text-sm font-medium text-astra-700 transition hover:bg-astra-50 disabled:opacity-60"
    >
      {isLoading ? 'A terminar sessão…' : 'Terminar sessão'}
    </button>
  );
}
