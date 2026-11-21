import { NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}


export async function GET() {
  const response = await fetch(`${getApiBaseUrl()}/billing/plans`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawData: unknown = await response.json().catch(() => null);
  const data: Record<string, unknown> = isRecord(rawData) ? rawData : {};

  return NextResponse.json(data, {
    status: response.status,
  });
}
