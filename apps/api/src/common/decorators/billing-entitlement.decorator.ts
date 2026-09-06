import { SetMetadata } from '@nestjs/common';

export const BILLING_FEATURE_KEY = 'billing_feature';
export const BILLING_LIMIT_KEY = 'billing_limit';

export const RequireBillingFeature = (feature: string) =>
  SetMetadata(BILLING_FEATURE_KEY, feature);

export const RequireBillingLimit = (limit: string) =>
  SetMetadata(BILLING_LIMIT_KEY, limit);
