export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Project {
  id: string;
  organization_id: string;
  customer_id: string | null;
  site_id: string | null;
  code: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  budget_cents: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  } | null;
  site?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  'http://localhost:3001';

export async function getProjects(accessToken?: string): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as obras.');
  }

  return response.json();
}

export async function getProject(
  id: string,
  accessToken?: string,
): Promise<Project> {
  const response = await fetch(`${API_URL}/api/v1/projects/${id}`, {
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar a obra.');
  }

  return response.json();
}
