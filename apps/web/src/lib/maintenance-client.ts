import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface UpdateMaintenancePlanInput {
  nextDue: string;
}

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

export async function updateMaintenancePlan(
  id: string,
  input: UpdateMaintenancePlanInput,
): Promise<MaintenancePlan> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<MaintenancePlan>(
    `/maintenance/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
