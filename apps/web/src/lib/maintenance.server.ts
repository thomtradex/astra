import { apiFetch } from './api-client';
import { getToken } from './auth';

export interface MaintenancePlan {
  id: string;
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMaintenancePlans() {
  return apiFetch<MaintenancePlan[]>(
    '/maintenance',
    {},
    (await getToken()) ?? undefined,
  );
}

export async function createMaintenancePlan(data: {
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
}) {
  return apiFetch<MaintenancePlan>(
    '/maintenance',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    (await getToken()) ?? undefined,
  );
}
