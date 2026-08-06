'use server';

import { redirect } from 'next/navigation';

import { deleteSite } from '@/lib/sites.server';

export async function deleteSiteAction(
  formData:FormData,
){

  await deleteSite(
    String(formData.get('id')),
  );

  redirect('/sites');

}
