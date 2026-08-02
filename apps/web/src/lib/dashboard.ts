import { apiFetch } from './api-client';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface DashboardSummary {
  users: number;
  sites: number;
  assets: number;
  auditLogs: number;
  database: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(
    ACCESS_TOKEN_COOKIE,
  )?.value;

  if (!accessToken) {
    return null;
  }

  try {
    return await apiFetch<DashboardSummary>(
      '/dashboard/summary',
      {
        method: 'GET',
      },
      accessToken,
    );
  } catch {
    return null;
  }
}
