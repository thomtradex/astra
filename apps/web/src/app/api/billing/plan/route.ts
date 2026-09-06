import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export async function PATCH(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';

  const response = await fetch(`${API_URL}/api/v1/billing/plan`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: await request.text(),
    cache: 'no-store',
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
