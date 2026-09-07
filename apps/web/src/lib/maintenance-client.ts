import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface MaintenancePlan {
  id: string;
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
  status: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMaintenancePlanInput {
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
}

export interface UpdateMaintenancePlanInput {
  plan?: string;
  assetId?: string;
  frequency?: string;
  nextDue?: string;
}

async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return accessToken;
}

export async function getMaintenancePlans(): Promise<MaintenancePlan[]> {
  const accessToken = await getAccessToken();

  return apiFetch<MaintenancePlan[]>(
    '/maintenance',
    { method: 'GET' },
    accessToken,
  );
}

export async function createMaintenancePlan(
  input: CreateMaintenancePlanInput,
): Promise<MaintenancePlan> {
  const accessToken = await getAccessToken();

  return apiFetch<MaintenancePlan>(
    '/maintenance',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}

export async function updateMaintenancePlan(
  id: string,
  input: UpdateMaintenancePlanInput,
): Promise<MaintenancePlan> {
  const accessToken = await getAccessToken();

  return apiFetch<MaintenancePlan>(
    `/maintenance/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
