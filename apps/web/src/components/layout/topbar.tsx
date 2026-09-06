'use client';

import Link from 'next/link';

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl md:px-7">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden md:block">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-950">
            Centro de operações
          </div>
        </div>

        <button
          type="button"
          className="hidden h-10 w-[280px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white lg:flex"
        >
          <span className="text-base">⌕</span>
          <span className="flex-1">Pesquisar na Astra...</span>
          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            ⌘ K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          aria-label="Pesquisar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
        >
          ⌕
        </button>

        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          ◌
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-astra-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        <Link
          href="/billing"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Subscrição
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
            A
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-slate-900">Administrador</span>
            <span className="block text-[10px] text-slate-400">Conta</span>
          </span>
          <span className="hidden text-slate-400 sm:block">⌄</span>
        </Link>
      </div>
    </header>
  );
}
