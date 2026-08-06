'use server';

import { redirect } from 'next/navigation';
import { updateAsset } from '@/lib/assets.server';

export async function updateAssetAction(
  id:string,
  formData:FormData,
){

  await updateAsset(id,{

    code:String(formData.get('code')),
    name:String(formData.get('name')),
    serialNumber:String(
      formData.get('serialNumber')||'',
    ),

  });

  redirect(`/assets/${id}`);

}
