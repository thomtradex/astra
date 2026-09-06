'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

async function registerAccount(data: {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  password: string;
}) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Não foi possível criar a conta.';

    throw new Error(message);
  }

  return body;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = (searchParams.get('plan') || 'FREE').toUpperCase();
  const next = searchParams.get('next');

  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await registerAccount({
        companyName,
        firstName,
        lastName,
        email,
        username: username || undefined,
        password,
      });

      router.push(
        next || `/billing/checkout?plan=${encodeURIComponent(plan)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a conta.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-astra-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white text-astra-950 shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-astra-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                Astra
              </Link>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-astra-300">
                  Começar com a Astra
                </p>

                <h1 className="mt-5 text-4xl font-bold tracking-tight">
                  A sua operação começa aqui.
                </h1>

                <p className="mt-6 text-lg leading-8 text-astra-100">
                  Crie a sua empresa na Astra e comece a organizar a operação
                  num sistema preparado para empresas de construção.
                </p>
              </div>
            </div>

            <p className="text-sm text-astra-300">
              Uma experiência profissional, simples e preparada para crescer.
            </p>
          </section>

          <section className="p-8 sm:p-12">
            <div className="mx-auto max-w-xl">
              <div className="lg:hidden">
                <Link
                  href="/"
                  className="text-2xl font-bold tracking-tight"
                >
                  Astra
                </Link>
              </div>

              <div className="mt-8 lg:mt-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-astra-600">
                  Criar conta
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Configure a sua empresa
                </h2>

                <p className="mt-3 text-astra-600">
                  Crie a conta do administrador da empresa para continuar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium">Empresa</label>
                  <input
                    required
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Construções Silva, Lda."
                    className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <input
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="João"
                      className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Apelido</label>
                    <input
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Silva"
                      className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Email profissional
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nome@empresa.pt"
                    className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Username{' '}
                    <span className="text-astra-400">(opcional)</span>
                  </label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="joao.silva"
                    className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">
                      Palavra-passe
                    </label>
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Confirmar palavra-passe
                    </label>
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repita a palavra-passe"
                      className="mt-2 w-full rounded-xl border border-astra-200 px-4 py-3 outline-none transition focus:border-astra-600 focus:ring-2 focus:ring-astra-100"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-astra-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-astra-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'A criar a sua conta...' : 'Criar conta'}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-center text-sm text-astra-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Já tem uma conta?</span>

                <Link
                  href={`/login?next=${encodeURIComponent(
                    next || `/billing/checkout?plan=${plan}`,
                  )}`}
                  className="font-semibold text-astra-950 hover:underline"
                >
                  Iniciar sessão
                </Link>
              </div>

              <p className="mt-8 text-center text-xs leading-5 text-astra-400">
                Ao criar a conta, poderá continuar com o plano selecionado.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
