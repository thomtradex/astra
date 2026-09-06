import { BackButton } from '@/components/navigation/back-button';

import { Suspense } from 'react';

import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-astra-500">Astra</p>
            <p className="mt-4 text-sm text-astra-600">A carregar…</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
