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
  organization_id?: string;
  site_id?: string | null;

  sites?: {
    id: string;
    name: string;
    code: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    is_active?: boolean;
  } | null;

  work_orders: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    organization_id?: string;
    asset_id?: string | null;
    project_id?: string | null;
    assigned_to_id?: string | null;
    created_at?: string;
    updated_at?: string;
  }>;

  maintenance_plans: Array<{
    id: string;
    plan: string;
    assetId: string;
    frequency: string;
    nextDue: string;
    status: string;
    organization_id?: string;
    created_at?: string;
    updated_at?: string;
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


export async function getAsset(id: string): Promise<Asset | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<Asset | null>(
    `/assets/${encodeURIComponent(id)}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}
