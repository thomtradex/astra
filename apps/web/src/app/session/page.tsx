import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/logout-button';
import { getSession } from '@/lib/auth';

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;

  redirect(params.redirect ?? '/dashboard');

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-astra-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-astra-500">Astra</p>
        <h1 className="mt-3 text-2xl font-light text-astra-950">Sessão autenticada</h1>
        <p className="mt-2 text-sm text-astra-600">
          Fundação Phase 0.1 — verificação de autenticação e permissões.
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="text-astra-500">Utilizador</dt>
            <dd className="mt-1 font-medium text-astra-900">
              {session.firstName} {session.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-astra-500">Email</dt>
            <dd className="mt-1 font-medium text-astra-900">{session.email}</dd>
          </div>
          <div>
            <dt className="text-astra-500">Roles</dt>
            <dd className="mt-1 font-medium text-astra-900">{session.roles.join(', ')}</dd>
          </div>
        </dl>

        <div className="mt-10">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
