'use server';

import { redirect } from 'next/navigation';

import { deleteAsset } from '@/lib/assets.server';

export async function deleteAssetAction(
  id:string,
){

  await deleteAsset(id);

  redirect('/assets');

}
