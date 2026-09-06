'use server';

import {
  executeCooAction,
} from '@/lib/intelligence-client';
import { listOrganizationUsers } from '@/lib/users-client';

export async function listAssignableUsers() {
  return listOrganizationUsers();
}

export async function assignWorkOrder(
  workOrderId: string,
  assignedToId: string,
) {
  if (!workOrderId) {
    throw new Error('Ordem de trabalho inválida.');
  }

  if (!assignedToId) {
    throw new Error('Selecione um responsável.');
  }

  const outcome = await executeCooAction({
    type: 'ASSIGN_WORK_ORDER',
    resourceId: workOrderId,
    assignedToId,
  });

  if (!outcome.allowed || outcome.status !== 'EXECUTED') {
    throw new Error(outcome.message);
  }

  return outcome;
}
