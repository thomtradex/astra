

import { apiFetch } from './api-client';
import { getToken } from './auth';





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
