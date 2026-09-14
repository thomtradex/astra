import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function forward(
  request: NextRequest,
  method: string,
  id: string,
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  let body: string | undefined;

  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
    body = await request.text();
  }

  const response = await fetch(`${getApiBaseUrl()}/work-orders/${id}`, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  return forward(request, 'GET', id);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  return forward(request, 'PATCH', id);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  return forward(request, 'DELETE', id);
}
