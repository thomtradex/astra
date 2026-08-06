

import { apiFetch } from './api-client';
import { getToken } from './auth';





export interface AuditItem {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  createdAt: string;
  actor?: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface AuditResponse {
  items: AuditItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getUserAudit(
  userId: string,
): Promise<AuditResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<AuditResponse>(
    `/audit?resource=users&resourceId=${userId}`,
    {},
    token,
  );
}


export async function getAuditLogs(
  params?: {
    resource?: string;
    action?: string;
    page?: number;
    limit?: number;
  },
): Promise<AuditResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  const search = new URLSearchParams();

  if (params?.resource) {
    search.set('resource', params.resource);
  }

  if (params?.action) {
    search.set('action', params.action);
  }

  if (params?.page) {
    search.set('page', String(params.page));
  }

  if (params?.limit) {
    search.set('limit', String(params.limit));
  }

  const query = search.toString();

  return apiFetch<AuditResponse>(
    `/audit${query ? `?${query}` : ''}`,
    {},
    token,
  );
}
