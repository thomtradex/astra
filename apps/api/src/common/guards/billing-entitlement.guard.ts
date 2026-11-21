import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { BillingService } from '../../modules/billing/billing.service';
import {
  BILLING_FEATURE_KEY,
} from '../decorators/billing-entitlement.decorator';

type BillingRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class BillingEntitlementGuard implements CanActivate {
  constructor(
    private readonly billingService: BillingService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatures = this.reflector.getAllAndOverride<
      string | string[]
    >(
      BILLING_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeatures || (
      Array.isArray(requiredFeatures) && requiredFeatures.length === 0
    )) {
      return true;
    }

    const features = Array.isArray(requiredFeatures)
      ? requiredFeatures
      : [requiredFeatures];

    const request = context.switchToHttp().getRequest<BillingRequest>();
    const organizationId = request.user?.organizationId;

    if (!organizationId) {
      throw new UnauthorizedException(
        'Authenticated user organization is required for billing entitlement checks.',
      );
    }

    for (const feature of features) {
      await this.billingService.assertFeature(organizationId, feature);
    }

    return true;
  }
}
