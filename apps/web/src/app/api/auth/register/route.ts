import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';

interface RegisterResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { message: 'Dados inválidos.' },
      { status: 400 },
    );
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const responseData: unknown = await response.json().catch(() => null);

  const data: RegisterResponse =
    responseData && typeof responseData === 'object'
      ? (responseData as RegisterResponse)
      : {};

  const nextResponse = NextResponse.json(data, {
    status: response.status,
  });

  const accessToken =
    typeof data.accessToken === 'string' ? data.accessToken : null;

  const refreshToken =
    typeof data.refreshToken === 'string' ? data.refreshToken : null;

  if (accessToken) {
    nextResponse.cookies.set('astra_access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  if (refreshToken) {
    nextResponse.cookies.set('astra_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return nextResponse;
}
