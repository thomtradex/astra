import { apiFetch } from './api-client';
import { getToken } from './auth';

export interface Customer {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>(
    '/customers',
    {},
    (await getToken()) ?? undefined,
  );
}

export async function createCustomer(data: {
  code: string;
  name: string;
  email?: string;
  phone?: string;
}): Promise<Customer> {
  return apiFetch<Customer>(
    '/customers',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    (await getToken()) ?? undefined,
  );
}
