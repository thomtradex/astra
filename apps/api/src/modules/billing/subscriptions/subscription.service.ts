import { Injectable } from '@nestjs/common';

import {
  OrganizationSubscription,
} from './subscription.types';

import {
  AstraPlan,
} from '../plans/plan.types';


@Injectable()
export class SubscriptionService {


  private subscriptions =
    new Map<string, OrganizationSubscription>();



  createTrial(
    organizationId: string,
  ): OrganizationSubscription {


    const subscription: OrganizationSubscription = {

      organizationId,

      plan: AstraPlan.STARTER,

      status: 'TRIALING',

      trialEndsAt:
        new Date(
          Date.now() +
          14 * 24 * 60 * 60 * 1000,
        ),

    };


    this.subscriptions.set(
      organizationId,
      subscription,
    );


    return subscription;
  }



  getSubscription(
    organizationId: string,
  ) {

    return this.subscriptions.get(
      organizationId,
    );

  }



  changePlan(
    organizationId: string,
    plan: AstraPlan,
  ) {


    const current =
      this.subscriptions.get(
        organizationId,
      );


    if (!current) {
      return null;
    }


    current.plan = plan;

    current.status = 'ACTIVE';


    return current;

  }

}
