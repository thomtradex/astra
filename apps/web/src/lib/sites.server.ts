import { apiFetch } from './api-client';
import { getToken } from './auth';

export interface Site {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSites(): Promise<Site[]> {
  return apiFetch('/sites', {}, ((await getToken() ?? undefined) ?? undefined));
}

export async function getSite(id: string): Promise<Site | null> {
  return apiFetch(`/sites/${id}`, {}, ((await getToken() ?? undefined) ?? undefined));
}

export async function createSite(data:{
  code:string;
  name:string;
}){
  return apiFetch(
    '/sites',
    {
      method:'POST',
      body:JSON.stringify(data),
    },
    ((await getToken() ?? undefined) ?? undefined),
  );
}

export async function updateSite(
  id:string,
  data:{
    code:string;
    name:string;
  },
){
  return apiFetch(
    `/sites/${id}`,
    {
      method:'PATCH',
      body:JSON.stringify(data),
    },
    ((await getToken() ?? undefined) ?? undefined),
  );
}

export async function deleteSite(
  id:string,
){
  return apiFetch(
    `/sites/${id}`,
    {
      method:'DELETE',
    },
    ((await getToken() ?? undefined) ?? undefined),
  );
}
