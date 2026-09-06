import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import type { IntelligenceBriefing } from './intelligence-client';
import { ACCESS_TOKEN_COOKIE } from './auth';

export interface DashboardOverview {
  customers: number;
  sites: number;
  assets: number;
  workOrders: {
    open: number;
    highPriority: number;
  };
  assetHealth: {
    active: number;
    total: number;
  };
  maintenance: {
    overdue: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: string;
  }>;
  generatedAt: string;
  intelligence?: IntelligenceBriefing;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<DashboardOverview>('/dashboard/overview', { method: 'GET' }, accessToken);
}
