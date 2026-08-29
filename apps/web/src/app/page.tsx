import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-astra-950">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-astra-500">
            Astra Platform
          </p>

          <h1 className="mt-6 text-5xl font-light leading-tight">
            Inteligência operacional para empresas de construção.
          </h1>

          <p className="mt-6 text-lg text-astra-600">
            Centralize projetos, ativos, manutenção e decisões críticas numa única plataforma
            empresarial.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/demo"
              className="rounded-lg bg-astra-900 px-6 py-3 text-white"
            >
              Agendar Demo
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-astra-200 px-6 py-3"
            >
              Entrar
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <h2 className="font-semibold">Operações</h2>
            <p className="mt-2 text-sm text-astra-600">
              Gestão completa de equipas e projetos.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-semibold">Ativos</h2>
            <p className="mt-2 text-sm text-astra-600">
              Monitorização inteligente de equipamentos.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="font-semibold">Intelligence</h2>
            <p className="mt-2 text-sm text-astra-600">
              Informação operacional em tempo real.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
