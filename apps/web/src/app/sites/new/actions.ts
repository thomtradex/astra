'use server';

import { redirect } from 'next/navigation';

import { createSite } from '@/lib/sites.server';

export async function createSiteAction(
  formData:FormData,
){

  await createSite({

    code:String(formData.get('code')),
    name:String(formData.get('name')),
  });

  redirect('/sites');

}
