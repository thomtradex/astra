import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth-constants';

export interface Asset {
  id: string;
  name: string;
  code: string;
  serial_number?: string | null;
  description?: string | null;
  status: string;
  site_id?: string | null;

  work_orders: Array<{
    id: string;
    status: string;
    priority?: string | null;
  }>;

  maintenance_plans: Array<{
    id: string;
    status: string;
    nextDue: string;
  }>;
  created_at: string;
  updated_at: string;
}

export async function getAssets(): Promise<Asset[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<Asset[]>(
    '/assets',
    {
      method: 'GET',
    },
    accessToken,
  );
}
