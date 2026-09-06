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

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : 'Não foi possível concluir a operação.';

    throw new Error(message);
  }

  return data as T;
}

export async function getBillingPlans(): Promise<BillingPlan[]> {
  const response = await fetch('/api/billing/plans', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  return parseResponse<BillingPlan[]>(response);
}

export async function activateFreePlan() {
  const response = await fetch('/api/billing/free', {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse(response);
}

export async function startTrial() {
  const response = await fetch('/api/billing/trial', {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse(response);
}

export async function createCheckout(planCode: string) {
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

  return parseResponse<{ url?: string }>(response);
}

export async function getCurrentSubscription() {
  const response = await fetch('/api/billing/subscription', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}


export async function changePlan(planCode: string) {
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

  const body = await response.text();

  let data: unknown = null;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Não foi possível alterar o plano.';

    throw new Error(message);
  }

  return data;
}


export async function createBillingPortalSession(returnUrl: string) {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnUrl }),
    cache: 'no-store',
  });

  return parseResponse<{ url: string }>(response);
}

export async function cancelSubscription() {
  const response = await fetch('/api/billing/cancel', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  });

  return parseResponse(response);
}

export async function reactivateSubscription() {
  const response = await fetch('/api/billing/reactivate', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  });

  return parseResponse(response);
}
