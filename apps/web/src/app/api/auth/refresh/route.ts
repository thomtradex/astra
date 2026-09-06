import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token missing' },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    const data = (await response.json()) as RefreshResponse;

    if (!response.ok || !data.accessToken) {
      return NextResponse.json(
        data,
        { status: response.status || 401 },
      );
    }

    const next = NextResponse.json({
      success: true,
      expiresIn: data.expiresIn,
    });

    next.cookies.set(
      ACCESS_TOKEN_COOKIE,
      data.accessToken,
      cookieOptions,
    );

    if (data.refreshToken) {
      next.cookies.set(
        REFRESH_TOKEN_COOKIE,
        data.refreshToken,
        cookieOptions,
      );
    }

    return next;
  } catch {
    return NextResponse.json(
      { message: 'Authentication service unavailable' },
      { status: 503 },
    );
  }
}
