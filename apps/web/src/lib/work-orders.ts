import { apiFetch } from './api-client';

export interface WorkOrder {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  organizationId: string;
  assetId?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  assignedToId?: string;
}

export interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  assignedToId?: string;
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  return apiFetch<WorkOrder[]>('/work-orders');
}

export async function getWorkOrder(id: string): Promise<WorkOrder | null> {
  return apiFetch<WorkOrder | null>(`/work-orders/${id}`);
}

export async function createWorkOrder(
  input: CreateWorkOrderInput,
): Promise<WorkOrder> {
  return apiFetch<WorkOrder>('/work-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWorkOrder(
  id: string,
  input: UpdateWorkOrderInput,
): Promise<unknown> {
  return apiFetch<unknown>(`/work-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteWorkOrder(id: string): Promise<void> {
  await apiFetch<void>(`/work-orders/${id}`, {
    method: 'DELETE',
  });
}
