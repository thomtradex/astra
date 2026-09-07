'use server';

import { revalidatePath } from 'next/cache';

import { executeCooAction } from '@/lib/intelligence-client';

export async function pauseProject(projectId: string) {
  if (!projectId || !projectId.trim()) {
    throw new Error('Projeto inválido.');
  }

  const outcome = await executeCooAction({
    type: 'SET_PROJECT_STATUS',
    resourceId: projectId,
    status: 'ON_HOLD',
  });

  if (!outcome.allowed || outcome.status !== 'EXECUTED') {
    throw new Error(outcome.message || 'Não foi possível colocar o projeto em pausa.');
  }

  revalidatePath('/intelligence');
  revalidatePath(`/projects/${projectId}`);

  return outcome;
}
