'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type HeaderUser = {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  name?: string;
  username?: string;
  userName?: string;
  email?: string;
};

function getDisplayName(user: HeaderUser): string {
  const fullName = [
    user.firstName || user.first_name,
    user.lastName || user.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    fullName ||
    user.name ||
    user.username || user.userName ||
    user.email?.split('@')[0] ||
    'Conta'
  );
}

export function MarketingHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (active) setUser(null);
          return;
        }

        const data = await response.json();
        const currentUser = data?.user || data?.data?.user || data;

        if (active && currentUser && typeof currentUser === 'object') {
          setUser(currentUser);
        }
      } catch {
        if (active) setUser(null);
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const displayName = user ? getDisplayName(user) : null;

  return (
    <header className="border-b border-astra-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-astra-950"
        >
          Astra
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-astra-700 md:flex">
          <Link href="/features" className="transition hover:text-astra-950">
            Funcionalidades
          </Link>

          <Link href="/enterprise" className="transition hover:text-astra-950">
            Enterprise
          </Link>

          <Link href="/pricing" className="transition hover:text-astra-950">
            Preços
          </Link>

          <Link href="/security" className="transition hover:text-astra-950">
            Segurança
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl border border-astra-200 bg-white px-4 py-2.5 text-sm font-medium text-astra-900 shadow-sm transition hover:border-astra-300 hover:shadow-md"
            >
              {displayName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-astra-700 transition hover:text-astra-950"
            >
              Login
            </Link>
          )}

          <Link
            href="/plans?plan=FREE"
            className="rounded-xl bg-astra-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-astra-800"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
