import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { BillingService } from '../../modules/billing/billing.service';
import {
  BILLING_FEATURE_KEY,
} from '../decorators/billing-entitlement.decorator';

type BillingRequest = Request & {
  user?: {
    organizationId?: string;
    organization_id?: string;
  };
};

@Injectable()
export class BillingEntitlementGuard implements CanActivate {
  constructor(
    private readonly billingService: BillingService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      BILLING_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<BillingRequest>();
    const organizationId =
      request.user?.organizationId ?? request.user?.organization_id;

    if (!organizationId) {
      return true;
    }

    await this.billingService.assertFeature(
      organizationId,
      requiredFeature,
    );

    return true;
  }
}
