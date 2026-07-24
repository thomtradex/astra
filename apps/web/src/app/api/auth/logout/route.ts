import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (refreshToken && accessToken) {
    try {
      await apiFetch<void>(
        '/auth/logout',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        },
        accessToken,
      );
    } catch {
      // Proceed with local cookie cleanup even if remote logout fails
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);

  return response;
}
