'use server';

import { cookies } from 'next/headers';

import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';

export async function rescheduleMaintenanceOperational(
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

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Sessão inválida. Volte a iniciar sessão.');
  }

  const response = await fetch(
    `${getApiBaseUrl()}/maintenance/${maintenancePlanId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nextDue: parsedDate.toISOString(),
      }),
      cache: 'no-store',
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        'Não foi possível alterar a próxima intervenção.',
    );
  }

  return payload;
}
