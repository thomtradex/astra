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

export interface RiskAssessment {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

export interface RiskAssessmentsResponse {
  items: RiskAssessment[];
  total: number;
}

export async function getRiskAssessments():
Promise<RiskAssessmentsResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return apiFetch<RiskAssessmentsResponse>(
    '/risk/assessments',
    {},
    token,
  );
}
