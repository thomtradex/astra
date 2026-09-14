import { cookies } from 'next/headers';

import { getApiBaseUrl } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth-constants';
import type { WorkOrder } from './work-orders-client';

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return [];
    }

    const response = await fetch(`${getApiBaseUrl()}/work-orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return payload as WorkOrder[];
  } catch (error) {
    console.error('Failed to load work orders', error);
    return [];
  }
}
