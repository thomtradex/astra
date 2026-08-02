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

export interface SecurityEvent {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
}

export interface SecurityResponse {
  items: SecurityEvent[];
  total: number;
  page: number;
  limit: number;
}

export async function getSecurityEvents():
Promise<SecurityResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<SecurityResponse>(
    '/audit?resource=security',
    {},
    token,
  );
}


export interface SessionItem {
  id: string;
  userEmail: string;
  ipAddress: string;
  createdAt: string;
}

export interface SessionsResponse {
  items: SessionItem[];
  total: number;
}


export async function getSessions():
Promise<SessionsResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<SessionsResponse>(
    '/security/sessions',
    {},
    token,
  );
}


export interface SecurityAlert {
  id: string;
  title: string;
  severity: string;
  createdAt: string;
}

export interface SecurityAlertsResponse {
  items: SecurityAlert[];
  total: number;
}


export async function getSecurityAlerts():
Promise<SecurityAlertsResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<SecurityAlertsResponse>(
    '/security/alerts',
    {},
    token,
  );
}
