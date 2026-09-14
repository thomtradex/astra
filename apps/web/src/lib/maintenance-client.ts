export interface MaintenancePlan {
  id: string;
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
  status: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaintenancePlanInput {
  plan: string;
  assetId: string;
  frequency: string;
  nextDue: string;
  status?: string;
}

export interface UpdateMaintenancePlanInput {
  plan?: string;
  assetId?: string;
  frequency?: string;
  nextDue?: string;
  status?: string;
}

async function request<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Maintenance request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  return payload as T;
}

export async function createMaintenancePlan(
  input: CreateMaintenancePlanInput,
): Promise<MaintenancePlan> {
  return request<MaintenancePlan>('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateMaintenancePlan(
  id: string,
  input: UpdateMaintenancePlanInput,
): Promise<MaintenancePlan> {
  return request<MaintenancePlan>(`/api/maintenance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
