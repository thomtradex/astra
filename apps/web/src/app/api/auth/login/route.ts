import { NextRequest, NextResponse } from 'next/server';

import { AuthTokens } from '@astra/shared';

import { apiFetch } from '@/lib/api-client';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildAuthCookieOptions,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    organizationSlug?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const tokens = await apiFetch<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        organizationSlug: body.organizationSlug,
      }),
    });

    const response = NextResponse.json({ success: true, expiresIn: tokens.expiresIn });

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
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 },
    );
  }
}
