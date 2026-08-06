import { apiFetch } from './api-client';
import { getToken } from './auth';

export interface Asset{
  id:string;
  name:string;
  code:string;
  serialNumber?:string|null;
  status:string;
}

export async function getAssets(): Promise<Asset[]> {
  return apiFetch<Asset[]>(
    '/assets',
    {},
    await getToken() ?? undefined,
  );
}

export async function getAsset(id:string): Promise<Asset | null> {
  return apiFetch<Asset | null>(
    `/assets/${id}`,
    {},
    await getToken() ?? undefined,
  );
}

export async function createAsset(data:{
  code:string;
  name:string;
  serialNumber?:string;
}){
  return apiFetch(
    '/assets',
    {
      method:'POST',
      body:JSON.stringify(data),
    },
    await getToken() ?? undefined,
  );
}

export async function updateAsset(
  id:string,
  data:{
    code:string;
    name:string;
    serialNumber?:string;
  },
){
  return apiFetch(
    `/assets/${id}`,
    {
      method:'PATCH',
      body:JSON.stringify(data),
    },
    await getToken() ?? undefined,
  );
}

export async function deleteAsset(
  id:string,
){
  return apiFetch(
    `/assets/${id}`,
    {
      method:'DELETE',
    },
    await getToken() ?? undefined,
  );
}
