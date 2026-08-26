import { NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://api:3001';

interface LoginRequest {
  email: string;
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

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
