'use client';

export async function login(
  email: string,
  password: string,
  organizationSlug?: string,
): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      organizationSlug,
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'message' in errorBody &&
      typeof errorBody.message === 'string'
        ? errorBody.message
        : 'Invalid credentials';

    throw new Error(message);
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}
