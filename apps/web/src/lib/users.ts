import { cookies } from 'next/headers';

import { apiFetch } from './api-client';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
}

export interface UsersResponse {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

const ACCESS_TOKEN_COOKIE = 'access_token';

export async function getUsers(): Promise<UsersResponse | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    ACCESS_TOKEN_COOKIE,
  )?.value;

  if (!token) {
    return null;
  }

  try {
    return await apiFetch<UsersResponse>(
      '/users',
      {
        method: 'GET',
      },
      token,
    );
  } catch {
    return null;
  }
}
