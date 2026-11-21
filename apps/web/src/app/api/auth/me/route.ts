import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';
import { buildAuthCookieOptions } from '@/lib/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth-constants';

interface RefreshTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

function isRefreshTokens(value: unknown): value is RefreshTokens {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    (candidate.accessToken === undefined ||
      typeof candidate.accessToken === 'string') &&
    (candidate.refreshToken === undefined ||
      typeof candidate.refreshToken === 'string') &&
    (candidate.expiresIn === undefined ||
      typeof candidate.expiresIn === 'number')
  );
}

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const callMe = async (token: string): Promise<Response> =>
    fetch(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

  let response = accessToken ? await callMe(accessToken) : null;

  if (!response?.ok && refreshToken) {
    const refreshResponse = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (refreshResponse.ok) {
      const tokenPayload: unknown = await refreshResponse.json().catch(() => null);
      const tokens = isRefreshTokens(tokenPayload) ? tokenPayload : null;

      if (tokens?.accessToken) {
        accessToken = tokens.accessToken;

        const result = NextResponse.next();

        result.cookies.set(
          ACCESS_TOKEN_COOKIE,
          tokens.accessToken,
          buildAuthCookieOptions(tokens.expiresIn ?? 60 * 60),
        );

        if (tokens.refreshToken) {
          result.cookies.set(
            REFRESH_TOKEN_COOKIE,
            tokens.refreshToken,
            buildAuthCookieOptions(60 * 60 * 24 * 7),
          );
        }

        response = await callMe(tokens.accessToken);

        if (response.ok) {
          const data: unknown = await response.json();
          return NextResponse.json(data, {
            status: 200,
            headers: {
              'Cache-Control': 'no-store',
            },
          });
        }
      }
    }
  }

  if (!response?.ok) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const data: unknown = await response.json();

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
