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
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      BILLING_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<BillingRequest>();
    const organizationId = request.user?.organizationId;

    if (!organizationId) {
      throw new UnauthorizedException(
        'Authenticated user organization is required for billing entitlement checks.',
      );
    }

    await this.billingService.assertFeature(
      organizationId,
      requiredFeature,
    );

    return true;
  }
}
