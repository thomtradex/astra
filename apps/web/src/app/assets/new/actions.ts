'use server';

import { redirect } from 'next/navigation';
import { createAsset } from '@/lib/assets.server';

export async function createAssetAction(
  formData:FormData,
){

  await createAsset({

    code:String(formData.get('code')),
    name:String(formData.get('name')),
    serialNumber:String(
      formData.get('serialNumber')||'',
    ),

  });

  redirect('/assets');

}
