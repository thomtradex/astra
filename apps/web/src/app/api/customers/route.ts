import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';


function getToken(request: NextRequest) {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function GET(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('search') ?? '';
  const page = request.nextUrl.searchParams.get('page') ?? '1';
  const limit = request.nextUrl.searchParams.get('limit') ?? '25';

  const params = new URLSearchParams({
    page,
    limit,
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(
    `${getApiBaseUrl()}/customers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const body: unknown = await request.json();

  const response = await fetch(`${getApiBaseUrl()}/customers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data: unknown = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
