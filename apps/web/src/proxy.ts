import { NextRequest, NextResponse } from 'next/server';

import { decodeJwt } from '@/lib/jwt';

const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/enterprise',
  '/contact',
  '/login',
  '/register',
  '/product-preview',
  '/plans',
  '/features',
  '/security',
  '/demo',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/billing/plans',
];

type RefreshTokens = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

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

function shouldRefreshAccessToken(accessToken: string | undefined): boolean {
  if (!accessToken) {
    return true;
  }

  const payload = decodeJwt(accessToken);

  if (!payload?.exp) {
    return true;
  }

  const expiresInMs = payload.exp * 1000 - Date.now();

  return expiresInMs < 60_000;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('astra_access_token')?.value;

  const refreshToken = request.cookies.get('astra_refresh_token')?.value;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (pathname === '/billing/checkout') {
    if (!accessToken && !refreshToken) {
      const plan = (request.nextUrl.searchParams.get('plan') || 'FREE').toUpperCase();
      const loginUrl = new URL('/login', request.url);

      loginUrl.searchParams.set('plan', plan);
      loginUrl.searchParams.set(
        'next',
        `/billing/checkout?plan=${encodeURIComponent(plan)}`,
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path),
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!refreshToken && !accessToken) {
    const loginUrl = new URL('/login', request.url);

    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (refreshToken && shouldRefreshAccessToken(accessToken)) {
    const API_URL =
      process.env.API_URL ??
      'http://localhost:3001';

    const API_BASE_URL = API_URL.replace(/\/$/, '').endsWith('/api/v1')
      ? API_URL.replace(/\/$/, '')
      : `${API_URL.replace(/\/$/, '')}/api/v1`;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        const payload: unknown = await refreshResponse.json();
        const tokens = isRefreshTokens(payload) ? payload : null;

        if (tokens?.accessToken) {
          const response = NextResponse.next();

          response.cookies.set(
            'astra_access_token',
            tokens.accessToken,
            {
              httpOnly: true,
              secure: process.env.COOKIE_SECURE === 'true',
              sameSite: 'lax',
              path: '/',
              maxAge: tokens.expiresIn ?? 900,
            },
          );

          if (tokens.refreshToken) {
            response.cookies.set(
              'astra_refresh_token',
              tokens.refreshToken,
              {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
              },
            );
          }

          return response;
        }
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set(
        'next',
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);

    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
