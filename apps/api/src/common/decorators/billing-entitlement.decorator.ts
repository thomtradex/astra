import { SetMetadata } from '@nestjs/common';

export const BILLING_FEATURE_KEY = 'billing_feature';

export const RequireBillingFeature = (
  feature: string | string[],
) => SetMetadata(BILLING_FEATURE_KEY, feature);
