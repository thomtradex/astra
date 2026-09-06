'use server';

import { updateMaintenancePlan } from '@/lib/maintenance-client';

export async function rescheduleMaintenance(
  maintenancePlanId: string,
  nextDue: string,
) {
  if (!maintenancePlanId) {
    throw new Error('Plano de manutenção inválido.');
  }

  if (!nextDue) {
    throw new Error('Selecione uma nova data.');
  }

  const parsedDate = new Date(nextDue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('A nova data de manutenção é inválida.');
  }

  return updateMaintenancePlan(maintenancePlanId, {
    nextDue: parsedDate.toISOString(),
  });
}
