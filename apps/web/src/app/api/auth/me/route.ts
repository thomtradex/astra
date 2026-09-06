import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://127.0.0.1:3001';

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const callMe = async (token: string) =>
    fetch(`${API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

  let response = accessToken ? await callMe(accessToken) : null;

  if (!response?.ok && refreshToken) {
    const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();

      if (tokens?.accessToken) {
        accessToken = tokens.accessToken;

        const result = NextResponse.next();

        result.cookies.set(
          ACCESS_TOKEN_COOKIE,
          tokens.accessToken,
          buildAuthCookieOptions(tokens.expiresIn),
        );

        if (tokens.refreshToken) {
          result.cookies.set(
            REFRESH_TOKEN_COOKIE,
            tokens.refreshToken,
            buildAuthCookieOptions(60 * 60 * 24 * 7),
          );
        }

        const retry = await callMe(tokens.accessToken);

        if (retry.ok) {
          const data = await retry.json();
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

  const data = await response.json();

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
