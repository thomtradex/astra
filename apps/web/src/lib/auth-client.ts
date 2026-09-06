'use client';

export async function login(
  identifier: string,
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
      identifier,
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
        : 'Credenciais inválidas';

    throw new Error(message);
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentSubscription() {
  const response = await fetch('/api/billing/subscription', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function startTrial() {
  const response = await fetch('/api/billing/trial', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to start trial');
  }

  return response.json();
}
