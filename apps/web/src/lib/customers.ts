import { cookies } from 'next/headers';

import { getApiBaseUrl } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth-constants';

export type CustomerProject = {
  id: string;
  code: string;
  name: string;
  status: string;
  progress?: number;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  projects?: CustomerProject[];
};

export type CustomersResponse = {
  items: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getCustomers(
  search?: string,
  options?: {
    page?: number;
    limit?: number;
  },
): Promise<CustomersResponse> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 25;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }

  const response = await fetch(
    `${getApiBaseUrl()}/customers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }

  const payload: unknown = await response.json();
  return payload as CustomersResponse;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  return payload as Customer;
}
