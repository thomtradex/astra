import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { BillingEntitlementGuard } from './billing-entitlement.guard';
import { BillingService } from '../../modules/billing/billing.service';

describe('BillingEntitlementGuard', () => {
  let guard: BillingEntitlementGuard;
  let billingService: {
    assertFeature: jest.Mock;
  };
  let reflector: {
    get: jest.Mock;
  };

  beforeEach(() => {
    billingService = {
      assertFeature: jest.fn(),
    };

    reflector = {
      get: jest.fn(),
    };

    guard = new BillingEntitlementGuard(
      reflector as unknown as Reflector,
      billingService as unknown as BillingService,
    );
  });

  function context(user = { organizationId: 'org-1' }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('allows routes without billing metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(context()),
    ).resolves.toBe(true);

    expect(billingService.assertFeature).not.toHaveBeenCalled();
  });

  it('checks billing feature entitlement when metadata exists', async () => {
    reflector.getAllAndOverride.mockReturnValue('cooActions');

    await expect(
      guard.canActivate(context()),
    ).resolves.toBe(true);

    expect(billingService.assertFeature).toHaveBeenCalledWith(
      'org-1',
      'cooActions',
    );
  });
});
