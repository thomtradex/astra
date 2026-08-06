'use server';

import { redirect } from 'next/navigation';

import { createMaintenancePlan } from '@/lib/maintenance.server';

export async function createMaintenancePlanAction(
  formData: FormData,
) {
  await createMaintenancePlan({
    plan: String(formData.get('plan') ?? ''),
    assetId: String(formData.get('assetId') ?? ''),
    frequency: String(formData.get('frequency') ?? ''),
    nextDue: String(formData.get('nextDue') ?? ''),
  });

  redirect('/maintenance');
}
