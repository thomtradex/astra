import { Prisma } from '@astra/database';
import { StripeSubscriptionSyncLockService } from './stripe-subscription-sync-lock.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('StripeSubscriptionSyncLockService', () => {
  let service: StripeSubscriptionSyncLockService;

  const createMany = jest.fn();
  const updateMany = jest.fn();
  const queryRaw = jest.fn();
  const executeRaw = jest.fn();

  const prisma = {
    stripeSubscriptionSyncLock: {
      createMany,
      updateMany,
    },
    $queryRaw: queryRaw,
    $executeRaw: executeRaw,
  };

  const claim = {
    subscriptionId: 'sub_1',
    token: 'owner_1',
    generation: 1n,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    createMany.mockResolvedValue({ count: 1 });
    updateMany.mockResolvedValue({ count: 1 });
    queryRaw.mockResolvedValue([{ generation: 1n }]);
    executeRaw.mockResolvedValue(1);

    service = new StripeSubscriptionSyncLockService(
      prisma as unknown as PrismaService,
    );
  });

  it('acquires a lock and returns its generation', async () => {
    await expect(service.acquire('sub_1')).resolves.toEqual({
      subscriptionId: 'sub_1',
      token: expect.any(String),
      generation: 1n,
    });

    expect(createMany).toHaveBeenCalledWith({
      data: [{ subscriptionId: 'sub_1' }],
      skipDuplicates: true,
    });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(Prisma).toBeDefined();
  });

  it('rejects acquisition when another worker owns the lock', async () => {
    queryRaw.mockResolvedValueOnce([]);

    await expect(service.acquire('sub_1')).resolves.toBeNull();

    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty subscription ID', async () => {
    await expect(service.acquire('')).rejects.toThrow(
      'Stripe subscription ID is required',
    );

    expect(createMany).not.toHaveBeenCalled();
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('renews only a valid, unexpired claim', async () => {
    await expect(service.renew(claim)).resolves.toBe(true);

    expect(executeRaw).toHaveBeenCalledTimes(1);
  });

  it('cannot renew a lost claim', async () => {
    executeRaw.mockResolvedValueOnce(0);

    await expect(service.renew(claim)).resolves.toBe(false);
  });

  it('releases only the matching owner and generation', async () => {
    await expect(service.release(claim)).resolves.toBe(true);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        subscriptionId: claim.subscriptionId,
        claimToken: claim.token,
        generation: claim.generation,
      },
      data: {
        claimToken: null,
        expiresAt: null,
      },
    });
  });

  it('cannot release a claim owned by another worker', async () => {
    updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(service.release(claim)).resolves.toBe(false);
  });

  describe('assertOwnershipInTransaction validates fencing', () => {
    it('accepts the current owner inside the transaction', async () => {
      const tx = {
        $executeRaw: jest.fn().mockResolvedValue(1),
      };

      await expect(
        service.assertOwnershipInTransaction(
          tx as never,
          claim,
        ),
      ).resolves.toBeUndefined();

      expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('rejects a previous owner after the generation changes', async () => {
      const tx = {
        $executeRaw: jest.fn().mockResolvedValue(0),
      };

      await expect(
        service.assertOwnershipInTransaction(
          tx as never,
          claim,
        ),
      ).rejects.toThrow(
        'Stripe subscription synchronization claim is no longer valid',
      );
    });

    it('rejects an expired claim', async () => {
      const tx = {
        $executeRaw: jest.fn().mockResolvedValue(0),
      };

      await expect(
        service.assertOwnershipInTransaction(
          tx as never,
          claim,
        ),
      ).rejects.toThrow(
        'Stripe subscription synchronization claim is no longer valid',
      );
    });
  });
});
