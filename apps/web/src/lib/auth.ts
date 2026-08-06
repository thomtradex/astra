import { cookies } from 'next/headers';

import { AuthTokens, JwtAccessPayload } from '@astra/shared';

import { apiFetch } from './api-client';

export const ACCESS_TOKEN_COOKIE = 'astra_access_token';
export const REFRESH_TOKEN_COOKIE = 'astra_refresh_token';

export interface SessionUser extends JwtAccessPayload {
  firstName: string;
  lastName: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      return await apiFetch<SessionUser>('/auth/me', { method: 'GET' }, accessToken);
    } catch {
      // Access token expired or invalid — attempt silent refresh below
    }
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    cookieStore.set(
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      buildAuthCookieOptions(tokens.expiresIn),
    );

    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      buildAuthCookieOptions(60 * 60 * 24 * 7),
    );

    return apiFetch<SessionUser>('/auth/me', { method: 'GET' }, tokens.accessToken);
  } catch {
    return null;
  }
}



export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ??
    null
  );
}

export function buildAuthCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export type { AuthTokens };
