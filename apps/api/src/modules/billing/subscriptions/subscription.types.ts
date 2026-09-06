import { AstraPlan } from '../plans/plan.types';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED';


export interface OrganizationSubscription {

  organizationId: string;

  plan: AstraPlan;

  status: SubscriptionStatus;

  trialEndsAt?: Date;

  currentPeriodEndsAt?: Date;

  customPricing?: boolean;

}
