import { cookies } from 'next/headers';

import { apiFetch } from './api-client';

const ACCESS_TOKEN_COOKIE = 'access_token';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ??
    null
  );
}

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
