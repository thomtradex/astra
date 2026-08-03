'use client';

import Link from 'next/link';
import type { Permission } from '@astra/shared';

import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Settings,
  ClipboardList,
} from 'lucide-react';

import { SessionUser } from '@/lib/auth';
import { can } from '@/lib/permissions';

interface SidebarItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}

const items: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Utilizadores',
    href: '/users',
    icon: Users,
    permission: 'user:read',
  },
  {
    label: 'Organizações',
    href: '/organizations',
    icon: Building2,
    permission: 'org:read',
  },
  {
    label: 'Auditoria',
    href: '/audit',
    icon: Shield,
    permission: 'audit:read',
  },
  {
    label: 'Work Orders',
    href: '/work-orders',
    icon: ClipboardList,
    permission: 'work_order:read',
  },
  {
    label: 'Definições',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const visibleItems = items.filter((item) => {
    if (!item.permission) {
      return true;
    }

    return can(user, item.permission);
  });

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
        {visibleItems.map((item) => {
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