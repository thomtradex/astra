'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Visão geral', icon: '⌂' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { href: '/projects', label: 'Projetos', icon: '▦' },
      { href: '/customers', label: 'Clientes', icon: '◎' },
      { href: '/assets', label: 'Ativos', icon: '◈' },
      { href: '/work-orders', label: 'Ordens de trabalho', icon: '✓' },
      { href: '/maintenance', label: 'Manutenção', icon: '↻' },
      { href: '/documents', label: 'Documentos', icon: '□' },
    ],
  },
  {
    label: 'Decisão',
    items: [
      { href: '/intelligence', label: 'Briefing COO', icon: '✦' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/reports', label: 'Relatórios', icon: '▤' },
      { href: '/team', label: 'Equipa', icon: '♙' },
      { href: '/billing', label: 'Subscrição', icon: '◫' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[264px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-astra-950 text-sm font-bold text-white shadow-sm">
            A
          </span>
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-slate-950">
              Astra
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Operations
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label} className="mb-7">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {section.label}
            </div>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all',
                      active
                        ? 'bg-astra-50 text-astra-950 shadow-sm ring-1 ring-astra-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-7 w-7 items-center justify-center rounded-lg text-sm transition',
                        active
                          ? 'bg-white text-astra-800 shadow-sm'
                          : 'text-slate-400 group-hover:text-slate-700',
                      ].join(' ')}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            ⚙
          </span>
          <span>Definições</span>
        </Link>

        <Link
          href="/help"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            ?
          </span>
          <span>Ajuda</span>
        </Link>
      </div>
    </aside>
  );
}
