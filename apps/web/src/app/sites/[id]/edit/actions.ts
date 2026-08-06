'use server';

import { redirect } from 'next/navigation';
import { updateSite } from '@/lib/sites.server';

export async function updateSiteAction(
  id:string,
  formData:FormData,
){

  await updateSite(id,{

    code:String(formData.get('code')),
    name:String(formData.get('name')),

  });

  redirect(`/sites/${id}`);

}
