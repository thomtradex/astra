import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET() {
  const response = await fetch(`${API_URL}/api/v1/billing/plans`, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
