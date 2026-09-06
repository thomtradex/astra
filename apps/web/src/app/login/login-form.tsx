'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { getCurrentSubscription, login } from '@/lib/auth-client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || searchParams.get('redirect') || '/dashboard';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(identifier, password, organizationSlug || undefined);

      if (nextPath && nextPath.startsWith('/')) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const subscription = await getCurrentSubscription();

      if (subscription) {
        router.push(nextPath);
      } else {
        router.replace('/plans');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <Link href="/" className="absolute left-6 top-6 text-sm text-astra-600 hover:text-astra-900">
        ← Voltar
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-astra-500">Astra</p>
          <h1 className="mt-3 text-3xl font-light text-astra-950">Entrar na plataforma</h1>
          <p className="mt-2 text-sm text-astra-600">Acesso seguro à plataforma Astra</p>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="rounded-2xl border border-astra-200 bg-white p-8 shadow-sm"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-astra-700">Email ou username</span>
            <input
              type="text"
              autoComplete="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-astra-200 px-4 py-3 text-astra-950 outline-none transition focus:border-astra-400 focus:ring-2 focus:ring-astra-100"
              placeholder="admin@astra.local"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-astra-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-astra-200 px-4 py-3 text-astra-950 outline-none transition focus:border-astra-400 focus:ring-2 focus:ring-astra-100"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-astra-700">
              Organização <span className="font-normal text-astra-500">(opcional)</span>
            </span>
            <input
              type="text"
              autoComplete="organization"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
              className="w-full rounded-lg border border-astra-200 px-4 py-3 text-astra-950 outline-none transition focus:border-astra-400 focus:ring-2 focus:ring-astra-100"
              placeholder="astra-demo"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full rounded-lg bg-astra-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-astra-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'A autenticar…' : 'Entrar'}
          </button>
          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
        <span>Ainda não tem uma conta?</span>
        <a
          href="/register"
          className="ml-1 font-semibold text-astra-700 transition hover:text-astra-900"
        >
          Criar conta
        </a>
      </div>
    </form>
      </div>
    </main>
  );
}
