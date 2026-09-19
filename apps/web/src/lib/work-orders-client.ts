export interface WorkOrder {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  asset_id?: string | null;
  assigned_to_id?: string | null;
  project_id?: string | null;
  organization_id?: string;
  updated_at?: string;
  assets?: {
    id: string;
    name: string;
    code: string;
    status: string;
  } | null;
  project?: {
    id: string;
    name: string;
    code: string;
    status: string;
  } | null;
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
  assignedToId?: string | null;
  projectId?: string | null;
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
    throw new Error(`Work order request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  return payload as T;
}

export async function createWorkOrder(
  input: CreateWorkOrderInput,
): Promise<WorkOrder> {
  return request<WorkOrder>('/api/work-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWorkOrder(
  id: string,
  input: UpdateWorkOrderInput,
): Promise<WorkOrder> {
  return request<WorkOrder>(`/api/work-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
