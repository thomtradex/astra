export interface CreateCheckoutSessionInput {
  organizationId: string;
  organizationName: string;
  planCode: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  trialDays: number;
}

export interface CheckoutSessionResult {
  id: string;
  url: string | null;
  provider: string;
}

export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;

  createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }>;

  changeSubscriptionPlan(subscriptionId: string, planCode: string, prorationBehavior?: 'always_invoice' | 'none'): Promise<void>;
  cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<void>;

  reactivateSubscription(subscriptionId: string): Promise<void>;
}
