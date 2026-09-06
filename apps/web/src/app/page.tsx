import Link from 'next/link';

import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

const questions = [
  'O que mudou desde ontem?',
  'O que está em risco?',
  'O que precisa da minha atenção agora?',
  'Que decisão devo tomar?',
  'O que acontece se nada for feito?',
];

const operationalAreas = [
  {
    title: 'Projetos',
    text: 'Identifique situações que exigem atenção antes de se perderem no acompanhamento diário.',
  },
  {
    title: 'Equipamentos',
    text: 'Tenha contexto sobre ativos, disponibilidade e ocorrências que podem exigir intervenção.',
  },
  {
    title: 'Manutenção',
    text: 'Encontre planos em atraso e situações que precisam de ação antes de se tornarem problemas maiores.',
  },
  {
    title: 'Ordens de trabalho',
    text: 'Priorize trabalho crítico, identifique responsabilidades e reduza decisões baseadas apenas em urgência aparente.',
  },
];

const flow = [
  ['01', 'Observar', 'Astra reúne os dados operacionais disponíveis.'],
  ['02', 'Detetar', 'Encontra situações que merecem atenção.'],
  ['03', 'Priorizar', 'Separa o importante do que pode esperar.'],
  ['04', 'Explicar', 'Mostra por que razão cada sinal importa.'],
  ['05', 'Recomendar', 'Indica a ação que deve ser considerada.'],
  ['06', 'Agir', 'Leva a decisão até ao responsável e à ação.'],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-astra-950">
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
          <div className="max-w-5xl">
            <div className="inline-flex items-center rounded-full border border-astra-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-astra-600 shadow-sm">
              Astra COO
            </div>

            <p className="mt-8 text-sm uppercase tracking-[0.35em] text-astra-500">
              Digital Chief Operating Officer
            </p>

            <h1 className="mt-8 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Saiba o que precisa da sua atenção antes que se torne um problema.
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-relaxed text-astra-600">
              A Astra transforma os dados da sua operação em sinais, prioridades, decisões e
              ações — para que cada responsável saiba onde deve concentrar o seu tempo.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/plans?plan=FREE"
                className="rounded-xl bg-astra-900 px-8 py-4 font-medium text-white transition hover:bg-astra-800"
              >
                Começar gratuitamente
              </Link>

              <Link
                href="/enterprise"
                className="rounded-xl border border-astra-200 px-8 py-4 font-medium transition hover:border-astra-400 hover:bg-astra-50"
              >
                Falar com a equipa
              </Link>
            </div>

            <p className="mt-5 text-sm text-astra-500">
              Comece com a operação essencial. Evolua quando precisar de mais inteligência e
              capacidade de decisão.
            </p>
          </div>

          <div className="mt-20 rounded-3xl border border-astra-100 bg-astra-50 p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-astra-500">
                O briefing operacional
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Antes de começar o dia, saiba onde deve olhar.
              </h2>

              <p className="mt-5 text-lg leading-8 text-astra-600">
                Em vez de procurar informação em vários sistemas, a Astra organiza o contexto
                operacional e destaca aquilo que merece atenção.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {questions.map((question, index) => (
                <div
                  key={question}
                  className="rounded-2xl border border-astra-100 bg-white p-6 shadow-sm"
                >
                  <span className="text-sm font-semibold text-astra-400">
                    0{index + 1}
                  </span>
                  <p className="mt-4 text-lg font-medium">{question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-astra-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-astra-500">
              De informação a decisão
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              A Astra não cria mais um dashboard.
            </h2>

            <p className="mt-6 text-lg leading-8 text-astra-600">
              A Astra existe para transformar informação operacional dispersa em contexto útil
              para quem tem de decidir.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {flow.map(([number, title, text]) => (
              <div key={number} className="rounded-3xl bg-white p-8">
                <span className="text-sm font-semibold text-astra-400">{number}</span>
                <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
                <p className="mt-4 leading-7 text-astra-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-astra-500">
                Construída para operações complexas
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Não substitui os seus sistemas. Torna-os mais úteis.
              </h2>

              <p className="mt-6 text-lg leading-8 text-astra-600">
                ERP, projetos, manutenção, equipamentos, clientes e outras fontes continuam a
                existir. A Astra acrescenta uma camada operacional que ajuda a compreender o que
                está a acontecer e o que merece atenção.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {operationalAreas.map((area) => (
                <div key={area.title} className="rounded-3xl border border-astra-100 p-8">
                  <h3 className="text-2xl font-semibold">{area.title}</h3>
                  <p className="mt-4 leading-7 text-astra-600">{area.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-astra-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
              O objetivo
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              Menos tempo a procurar informação. Mais tempo a tomar boas decisões.
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
              A Astra ajuda diretores, gestores e responsáveis operacionais a concentrar atenção
              no que realmente importa — com contexto, evidência e uma ação recomendada.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/plans"
                className="rounded-xl bg-white px-8 py-4 font-medium text-astra-950 transition hover:bg-astra-50"
              >
                Ver planos
              </Link>

              <Link
                href="/enterprise"
                className="rounded-xl border border-white/20 px-8 py-4 font-medium text-white transition hover:bg-white/10"
              >
                Explorar Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
