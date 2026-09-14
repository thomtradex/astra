import { getApiBaseUrl } from './api-client';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

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

export async function getProjects(accessToken?: string): Promise<Project[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();

    if (Array.isArray(payload)) {
      return payload as Project[];
    }

    if (payload !== null && typeof payload === 'object') {
      const record = payload as { data?: unknown; items?: unknown };

      if (Array.isArray(record.data)) {
        return record.data as Project[];
      }

      if (Array.isArray(record.items)) {
        return record.items as Project[];
      }
    }

    return [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
}
export async function getProject(id: string, accessToken?: string): Promise<Project | null> {
  try {
    const response = await fetch(getApiBaseUrl() + '/projects/' + id, {
      headers: accessToken ? { Authorization: 'Bearer ' + accessToken } : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to load project:', response.status);
      return null;
    }

    const payload: unknown = await response.json();
    return payload as Project;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}
