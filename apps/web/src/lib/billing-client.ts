export type BillingPlan = {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  monthlyPriceCents: number;
  currency: string;
  trialDays: number;
  isActive?: boolean;
  displayOrder?: number;
  features?: Record<string, unknown>;
  limits?: Record<string, number>;
};

export type BillingSubscription = {
  id?: string;
  status?: string;
  planCode?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export type BillingResponse = Record<string, unknown>;

function getMessage(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  return 'Não foi possível concluir a operação.';
}

async function parseResponse<T>(
  response: Response,
  fallback: T,
): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getMessage(data));
  }

  return data === null ? fallback : (data as T);
}

export async function getBillingPlans(): Promise<BillingPlan[]> {
  const response = await fetch('/api/billing/plans', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  return parseResponse<BillingPlan[]>(response, []);
}

export async function activateFreePlan(): Promise<BillingResponse> {
  const response = await fetch('/api/billing/free', {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse<BillingResponse>(response, {});
}

export async function startTrial(): Promise<BillingResponse> {
  const response = await fetch('/api/billing/trial', {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse<BillingResponse>(response, {});
}

export async function createCheckout(
  planCode: string,
): Promise<{ url?: string }> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planCode: planCode.toUpperCase(),
    }),
  });

  return parseResponse<{ url?: string }>(response, {});
}

export async function getCurrentSubscription(): Promise<BillingSubscription | null> {
  const response = await fetch('/api/billing/subscription', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return parseResponse<BillingSubscription | null>(response, null);
}

export async function changePlan(
  planCode: string,
): Promise<BillingResponse> {
  const response = await fetch('/api/billing/plan', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planCode: planCode.toUpperCase(),
    }),
    cache: 'no-store',
  });

  return parseResponse<BillingResponse>(response, {});
}

export async function createBillingPortalSession(
  returnUrl: string,
): Promise<{ url: string }> {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnUrl }),
    cache: 'no-store',
  });

  return parseResponse<{ url: string }>(response, { url: '' });
}

export async function cancelSubscription(): Promise<BillingResponse> {
  const response = await fetch('/api/billing/cancel', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  });

  return parseResponse<BillingResponse>(response, {});
}

export async function reactivateSubscription(): Promise<BillingResponse> {
  const response = await fetch('/api/billing/reactivate', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  });

  return parseResponse<BillingResponse>(response, {});
}
