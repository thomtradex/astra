'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Settings,
} from 'lucide-react';

const items = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Utilizadores',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Organizações',
    href: '/organizations',
    icon: Building2,
  },
  {
    label: 'Auditoria',
    href: '/audit',
    icon: Shield,
  },
  {
    label: 'Definições',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-astra-200 bg-white">
      <div className="border-b border-astra-200 p-6">
        <h1 className="text-2xl font-semibold text-astra-900">
          ASTRA
        </h1>

        <p className="mt-1 text-sm text-astra-500">
          Operational Intelligence
        </p>
      </div>

      <nav className="space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-astra-700 transition hover:bg-astra-100 hover:text-astra-950"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}