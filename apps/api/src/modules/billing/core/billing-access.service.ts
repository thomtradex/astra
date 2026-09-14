import { Injectable } from '@nestjs/common';

import { EntitlementFeature } from '../entitlements/entitlement.types';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Injectable()
export class BillingAccessService {

  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}


  canAccess(
    organizationId: string,
    _feature: EntitlementFeature,
  ): boolean {

    const subscription =
      this.subscriptionService.getSubscription(
        organizationId,
      );


    if (!subscription) {
      return false;
    }


    if (
      subscription.status === 'CANCELED'
    ) {
      return false;
    }


    if (
      subscription.status === 'PAST_DUE'
    ) {
      return false;
    }


    return true;
  }

}
