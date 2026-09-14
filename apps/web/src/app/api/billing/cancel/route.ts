import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';


export async function PATCH(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';

  const response = await fetch(`${getApiBaseUrl()}/billing/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: await request.text(),
    cache: 'no-store',
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('content-type') ?? 'application/json',
    },
  });
}
