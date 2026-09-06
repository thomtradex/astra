import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Não autenticado.' },
      { status: 401 },
    );
  }

  const search = request.nextUrl.search;
  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/projects${search}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') ?? 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Não autenticado.' },
      { status: 401 },
    );
  }

  const body = await request.json();

  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/projects`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  );

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') ?? 'application/json',
    },
  });
}
