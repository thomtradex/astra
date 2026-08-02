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

export interface GovernancePolicy {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

export interface GovernancePoliciesResponse {
  items: GovernancePolicy[];
  total: number;
}

export async function getGovernancePolicies():
Promise<GovernancePoliciesResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<GovernancePoliciesResponse>(
    '/governance/policies',
    {},
    token,
  );
}
