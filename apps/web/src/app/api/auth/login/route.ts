import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';
import { buildAuthCookieOptions } from '@/lib/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth-constants';


interface LoginRequest {
  identifier?: string;
  email?: string;
  username?: string;
  password: string;
  organizationSlug?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginRequest;

  const identifier = (
    body.identifier ??
    body.username ??
    body.email ??
    ''
  ).trim();

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password: body.password,
      organizationSlug: body.organizationSlug,
    }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  const res = NextResponse.json(data);

  res.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, buildAuthCookieOptions(data.expiresIn));

  res.cookies.set(
    REFRESH_TOKEN_COOKIE,
    data.refreshToken,
    buildAuthCookieOptions(60 * 60 * 24 * 7),
  );

  return res;
}
