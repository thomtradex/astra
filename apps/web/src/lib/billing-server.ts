import { cookies } from 'next/headers';

import { ACCESS_TOKEN_COOKIE } from './auth-constants';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

function getApiBaseUrl(): string {
  const normalized = API_URL.replace(/\/$/, '');
  return normalized.endsWith('/api/v1')
    ? normalized
    : `${normalized}/api/v1`;
}

export interface CurrentSubscriptionServer {
  status: string;
  planCode?: string | null;
  plan?: { name?: string | null } | null;
}

export interface CurrentEntitlementsServer {
  plan?: { code?: string | null; name?: string | null } | null;
  limits?: Record<string, number> | null;
  features?: {
    intelligence?: boolean;
    cooActions?: boolean;
  } | null;
}

export async function getCurrentSubscriptionServer(): Promise<CurrentSubscriptionServer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${getApiBaseUrl()}/billing/subscription`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  return payload as CurrentSubscriptionServer;
}


export async function getCurrentEntitlementsServer(): Promise<CurrentEntitlementsServer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${getApiBaseUrl()}/billing/entitlements`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  return payload as CurrentEntitlementsServer;
}
