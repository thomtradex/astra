import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:3001';

async function getToken(request: NextRequest) {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const { id } = await context.params;

  const response = await fetch(`${API_URL}/api/v1/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const response = await fetch(`${API_URL}/api/v1/customers/${id}`, {
    method: 'PATCH',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  const { id } = await params;

  const response = await fetch(`${API_URL}/api/v1/customers/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
