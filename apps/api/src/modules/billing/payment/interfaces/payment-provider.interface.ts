export interface CreateCheckoutSessionInput {
  organizationId: string;
  organizationName?: string;
  customerEmail: string;
  planCode: string;
  stripePriceId: string;
  checkoutAttemptId: string;
  idempotencyKey: string;
  trialDays: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  id: string;
  url?: string | null;
  provider: string;
  expiresAt?: Date | null;
}

export interface PaymentProvider {
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult>;

  createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{
    url: string;
  }>;

  changeSubscriptionPlan(
    subscriptionId: string,
    planCode: string,
    prorationBehavior?: 'always_invoice' | 'none',
  ): Promise<void>;

  cancelSubscriptionAtPeriodEnd(
    subscriptionId: string,
  ): Promise<void>;

  reactivateSubscription(
    subscriptionId: string,
  ): Promise<void>;
}
