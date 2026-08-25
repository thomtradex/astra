import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://api:3001';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  const res = NextResponse.json(data);

  res.cookies.set('astra_access_token', data.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  res.cookies.set('astra_refresh_token', data.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  return res;
}
