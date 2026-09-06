import { cookies } from 'next/headers';

import { ACCESS_TOKEN_COOKIE } from './auth';

export async function getCurrentSubscriptionServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/billing/subscription`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}


export async function getCurrentEntitlementsServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/billing/entitlements`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}
