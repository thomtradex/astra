import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { BillingService } from '../../modules/billing/billing.service';
import {
  BILLING_FEATURE_KEY,
} from '../decorators/billing-entitlement.decorator';

import { BillingEntitlementGuard } from './billing-entitlement.guard';

describe('BillingEntitlementGuard', () => {
  const assertFeature = jest.fn<
    ReturnType<BillingService['assertFeature']>,
    Parameters<BillingService['assertFeature']>
  >();

  const billingService = {
    assertFeature,
  } as unknown as BillingService;

  const getAllAndOverride = jest.fn<
    string | string[] | undefined,
    [string, unknown[]]
  >();

  const reflector = {
    getAllAndOverride,
  } as unknown as Reflector;

  const guard = new BillingEntitlementGuard(
    billingService,
    reflector,
  );

  const handler = jest.fn();
  const classRef = jest.fn();

  const createContext = (user?: Partial<AuthenticatedUser>) =>
    ({
      getHandler: () => handler,
      getClass: () => classRef,
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows the request when no billing feature is required', async () => {
    getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(createContext()),
    ).resolves.toBe(true);

    expect(assertFeature).not.toHaveBeenCalled();
    expect(getAllAndOverride).toHaveBeenCalledWith(
      BILLING_FEATURE_KEY,
      [handler, classRef],
    );
  });

  it('checks the required feature for the authenticated organization', async () => {
    getAllAndOverride.mockReturnValue('intelligence');
    assertFeature.mockResolvedValue(undefined);

    await expect(
      guard.canActivate(
        createContext({
          organizationId: 'org-alpha',
        }),
      ),
    ).resolves.toBe(true);

    expect(assertFeature).toHaveBeenCalledWith(
      'org-alpha',
      'intelligence',
    );
  });

  it('propagates a denied billing entitlement', async () => {
    getAllAndOverride.mockReturnValue('cooActions');

    const entitlementError = new Error('Feature unavailable');

    assertFeature.mockRejectedValue(entitlementError);

    await expect(
      guard.canActivate(
        createContext({
          organizationId: 'org-alpha',
        }),
      ),
    ).rejects.toBe(entitlementError);

    expect(assertFeature).toHaveBeenCalledWith(
      'org-alpha',
      'cooActions',
    );
  });

  it('rejects a billing-protected request without an organization', async () => {
    getAllAndOverride.mockReturnValue('intelligence');

    await expect(
      guard.canActivate(createContext()),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(assertFeature).not.toHaveBeenCalled();
  });

  it('rejects when the authenticated organization id is empty', async () => {
    getAllAndOverride.mockReturnValue('intelligence');

    await expect(
      guard.canActivate(
        createContext({
          organizationId: '',
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(assertFeature).not.toHaveBeenCalled();
  });

  it('checks every required billing feature for the organization', async () => {
    getAllAndOverride.mockReturnValue(['intelligence', 'cooActions']);
    assertFeature.mockResolvedValue(undefined);

    await expect(
      guard.canActivate(
        createContext({ organizationId: 'org-alpha' }),
      ),
    ).resolves.toBe(true);

    expect(assertFeature).toHaveBeenNthCalledWith(
      1, 'org-alpha', 'intelligence',
    );
    expect(assertFeature).toHaveBeenNthCalledWith(
      2, 'org-alpha', 'cooActions',
    );
    expect(assertFeature).toHaveBeenCalledTimes(2);
  });

  it('stops checking features when the first entitlement is denied', async () => {
    getAllAndOverride.mockReturnValue(['intelligence', 'cooActions']);

    const entitlementError = new Error('Intelligence unavailable');
    assertFeature.mockRejectedValueOnce(entitlementError);

    await expect(
      guard.canActivate(
        createContext({ organizationId: 'org-alpha' }),
      ),
    ).rejects.toBe(entitlementError);

    expect(assertFeature).toHaveBeenCalledTimes(1);
    expect(assertFeature).toHaveBeenCalledWith(
      'org-alpha', 'intelligence',
    );
  });

});
