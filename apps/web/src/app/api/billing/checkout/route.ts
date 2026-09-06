import { cookies } from 'next/headers';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const planCode =
    body &&
    typeof body === 'object' &&
    typeof body.planCode === 'string'
      ? body.planCode.toUpperCase()
      : '';

  if (!['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(planCode)) {
    return NextResponse.json(
      { message: 'Plano inválido.' },
      { status: 400 },
    );
  }

  const response = await fetch(`${API_URL}/api/v1/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ planCode }),
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
