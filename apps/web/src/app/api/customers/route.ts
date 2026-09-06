import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:3001';

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
    `${API_URL}/api/v1/customers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/api/v1/customers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
