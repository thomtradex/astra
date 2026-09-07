import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  organization_id: string;
  project_id: string | null;
  asset_id: string | null;
  assigned_to_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  assignedToId?: string;
  projectId?: string;
}

export interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  assignedToId?: string;
  projectId?: string;
}

async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return accessToken;
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  const accessToken = await getAccessToken();

  return apiFetch<WorkOrder[]>(
    '/work-orders',
    { method: 'GET' },
    accessToken,
  );
}

export async function createWorkOrder(
  input: CreateWorkOrderInput,
): Promise<WorkOrder> {
  const accessToken = await getAccessToken();

  return apiFetch<WorkOrder>(
    '/work-orders',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}

export async function updateWorkOrder(
  id: string,
  input: UpdateWorkOrderInput,
): Promise<WorkOrder> {
  const accessToken = await getAccessToken();

  return apiFetch<WorkOrder>(
    `/work-orders/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
