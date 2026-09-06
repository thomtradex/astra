import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Não autenticado.' },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/projects/${id}`,
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

async function proxyRequest(
  request: NextRequest,
  method: 'PATCH' | 'DELETE',
  id: string,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Não autenticado.' },
      { status: 401 },
    );
  }

  const body =
    method === 'PATCH'
      ? await request.json()
      : undefined;

  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/projects/${id}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyRequest(request, 'PATCH', id);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyRequest(request, 'DELETE', id);
}
