import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface OrganizationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
}

export interface PaginatedUsers {
  items: OrganizationUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listOrganizationUsers(): Promise<OrganizationUser[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  const result = await apiFetch<PaginatedUsers>(
    '/users?page=1&limit=100',
    { method: 'GET' },
    accessToken,
  );

  return result.items.filter((user) => user.isActive);
}
