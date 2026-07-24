import { NextRequest, NextResponse } from 'next/server';

import { AuthTokens } from '@astra/shared';

import { apiFetch } from '@/lib/api-client';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildAuthCookieOptions,
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const redirectTo = request.nextUrl.searchParams.get('redirect') ?? '/session';

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const tokens = await apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      buildAuthCookieOptions(tokens.expiresIn),
    );

    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      buildAuthCookieOptions(60 * 60 * 24 * 7),
    );

    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }
}
