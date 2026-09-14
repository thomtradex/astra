import { NextResponse } from 'next/server';

import { getApiBaseUrl } from '@/lib/api-client';


export async function GET() {
  const response = await fetch(`${getApiBaseUrl()}/billing/plans`, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
