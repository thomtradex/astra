import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  const body = await request.text();

  const response = await fetch(`${API_URL}/api/v1/billing/portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body,
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
