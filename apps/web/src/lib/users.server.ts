
import { apiFetch } from './api-client';
import { getToken } from './auth';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  roles: string[];
}

export interface UsersResponse {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}



export async function getUsers(): Promise<UsersResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<UsersResponse>(
    '/users',
    {},
    token,
  );
}



export async function getUser(
  id: string,
): Promise<UserListItem | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<UserListItem>(
    `/users/${id}`,
    {},
    token,
  );
}

export async function createUser(
  input: CreateUserInput,
) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return apiFetch(
    '/users',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return apiFetch(
    `/users/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function disableUser(
  id: string,
) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return apiFetch(
    `/users/${id}`,
    {
      method: 'DELETE',
    },
    token,
  );
}


export async function assignUserRole(
  userId: string,
  roleId: string,
) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return apiFetch(
    `/users/${userId}/roles/${roleId}`,
    {
      method: 'POST',
    },
    token,
  );
}


export async function removeUserRole(
  userId: string,
  roleId: string,
) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return apiFetch(
    `/users/${userId}/roles/${roleId}`,
    {
      method: 'DELETE',
    },
    token,
  );
}
