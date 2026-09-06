import { Injectable } from '@nestjs/common';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { EntitlementFeature } from '../entitlements/entitlement.types';

@Injectable()
export class BillingAccessService {

  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}


  canAccess(
    organizationId: string,
    feature: EntitlementFeature,
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
