import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';

type CheckoutRequestBody = {
  planCode?: unknown;
};

type CheckoutResponseBody = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const body: CheckoutRequestBody = isRecord(rawBody) ? rawBody : {};

  const planCode =
    typeof body.planCode === 'string'
      ? body.planCode.toUpperCase()
      : '';

  if (!['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(planCode)) {
    return NextResponse.json(
      { message: 'Plano inválido.' },
      { status: 400 },
    );
  }

  const response = await fetch(`${getApiBaseUrl()}/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ planCode }),
    cache: 'no-store',
  });

  const rawData: unknown = await response.json().catch(() => null);
  const data: CheckoutResponseBody = isRecord(rawData) ? rawData : {};

  return NextResponse.json(data, {
    status: response.status,
  });
}
