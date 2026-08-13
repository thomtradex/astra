import { NextRequest, NextResponse } from 'next/server';

import { decodeJwt } from '@/lib/jwt';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/refresh'];

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('astra_access_token')?.value;
  const refreshToken = request.cookies.get('astra_refresh_token')?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    if (accessToken && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/session', request.url));
    }
    return NextResponse.next();
  }

  if (!refreshToken && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (refreshToken && shouldRefreshAccessToken(accessToken)) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(refreshUrl);
  }

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
