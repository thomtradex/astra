import { cookies } from 'next/headers';

import { getApiBaseUrl } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth-constants';
import type { MaintenancePlan } from './maintenance-client';
import { getAssets, type Asset } from './assets-client';
import {
  getIntelligenceBriefing,
  type IntelligenceBriefing,
} from './intelligence-client';

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export interface MaintenanceOperationalData {
  plans: MaintenancePlan[];
  assets: Asset[];
  briefing: IntelligenceBriefing | null;
}

export async function getMaintenanceOperationalData(): Promise<MaintenanceOperationalData> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      plans: [],
      assets: [],
      briefing: null,
    };
  }

  const response = await fetch(`${getApiBaseUrl()}/maintenance`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const plans = response.ok
    ? ((await response.json()) as MaintenancePlan[])
    : [];

  let assets: Asset[] = [];

  try {
    assets = await getAssets();
  } catch {
    assets = [];
  }

  let briefing: IntelligenceBriefing | null = null;

  try {
    briefing = await getIntelligenceBriefing();
  } catch {
    briefing = null;
  }

  return {
    plans,
    assets,
    briefing,
  };
}

export async function getMaintenancePlans(): Promise<MaintenancePlan[]> {
  const data = await getMaintenanceOperationalData();
  return data.plans;
}
