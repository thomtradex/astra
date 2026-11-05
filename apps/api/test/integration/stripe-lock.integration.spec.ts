import { PrismaClient } from '@astra/database';
import { randomUUID } from 'node:crypto';
import { requireIsolatedTestDatabase } from '../require-isolated-test-database';

describe('Stripe distributed lock — PostgreSQL integration', () => {
  let first: PrismaClient;
  let second: PrismaClient;

  const subscriptionId = 'sub_integration_' + randomUUID();

  beforeAll(async () => {
    const url = requireIsolatedTestDatabase();

    const parsed = new URL(url);

    if (
      parsed.hostname !== '127.0.0.1' ||
      parsed.port !== '55432' ||
      parsed.pathname !== '/astra_stripe_test'
    ) {
      throw new Error('Unexpected PostgreSQL integration test destination');
    }

    first = new PrismaClient({
      datasources: { db: { url } },
    });

    second = new PrismaClient({
      datasources: { db: { url } },
    });

    await Promise.all([first.$connect(), second.$connect()]);
  });

  afterAll(async () => {
    if (first) {
      await first.stripeSubscriptionSyncLock.deleteMany({
        where: { subscriptionId },
      });

      await first.$disconnect();
    }

    if (second) {
      await second.$disconnect();
    }
  });

  it('allows only one concurrent owner', async () => {
    const acquire = async (db: PrismaClient, token: string) => {
      await db.stripeSubscriptionSyncLock.createMany({
        data: [{ subscriptionId }],
        skipDuplicates: true,
      });

      const result = await db.stripeSubscriptionSyncLock.updateMany({
        where: {
          subscriptionId,
          OR: [
            { claimToken: null },
            { expiresAt: { lte: new Date() } },
          ],
        },
        data: {
          claimToken: token,
          expiresAt: new Date(Date.now() + 60_000),
          generation: { increment: 1 },
        },
      });

      return result.count === 1;
    };

    const [a, b] = await Promise.all([
      acquire(first, 'worker_a'),
      acquire(second, 'worker_b'),
    ]);

    expect([a, b].filter(Boolean)).toHaveLength(1);

    const owner = await first.stripeSubscriptionSyncLock.findUniqueOrThrow({
      where: { subscriptionId },
    });

    expect(owner.generation).toBe(1n);

    const released = await first.stripeSubscriptionSyncLock.updateMany({
      where: {
        subscriptionId,
        claimToken: owner.claimToken,
        generation: owner.generation,
      },
      data: {
        claimToken: null,
        expiresAt: null,
      },
    });

    expect(released.count).toBe(1);

    const next = await second.stripeSubscriptionSyncLock.updateMany({
      where: {
        subscriptionId,
        claimToken: null,
      },
      data: {
        claimToken: 'worker_next',
        expiresAt: new Date(Date.now() + 60_000),
        generation: { increment: 1 },
      },
    });

    expect(next.count).toBe(1);

    const current = await second.stripeSubscriptionSyncLock.findUniqueOrThrow({
      where: { subscriptionId },
    });

    expect(current.generation).toBe(2n);
    expect(current.claimToken).toBe('worker_next');

    const stale = await first.$transaction(async (tx) => {
      return tx.stripeSubscriptionSyncLock.updateMany({
        where: {
          subscriptionId,
          claimToken: owner.claimToken,
          generation: owner.generation,
          expiresAt: { gt: new Date() },
        },
        data: {
          updatedAt: new Date(),
        },
      });
    });

    expect(stale.count).toBe(0);
  });

  it('holds the fencing row lock until commit', async () => {
    const id = 'sub_fencing_' + randomUUID();

    await first.stripeSubscriptionSyncLock.create({
      data: {
        subscriptionId: id,
        claimToken: 'owner_a',
        generation: 1n,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    try {
      let releaseTransaction!: () => void;
      let signalReady!: () => void;

      const transactionGate = new Promise<void>((resolve) => {
        releaseTransaction = resolve;
      });

      const ready = new Promise<void>((resolve) => {
        signalReady = resolve;
      });

      const transaction = first.$transaction(async (tx) => {
        const result = await tx.stripeSubscriptionSyncLock.updateMany({
          where: {
            subscriptionId: id,
            claimToken: 'owner_a',
            generation: 1n,
            expiresAt: { gt: new Date() },
          },
          data: {
            updatedAt: new Date(),
          },
        });

        expect(result.count).toBe(1);
        signalReady();

        await transactionGate;
      });

      try {
        await ready;

        const competing = await second.$transaction(
          async (tx) => {
            await tx.$executeRawUnsafe(
              "SET LOCAL lock_timeout = '200ms'",
            );

            return tx.stripeSubscriptionSyncLock.updateMany({
              where: {
                subscriptionId: id,
                claimToken: 'owner_a',
              },
              data: {
                claimToken: 'owner_b',
                generation: { increment: 1 },
              },
            });
          },
        ).then(
          () => 'acquired',
          (error) => {
            const message =
              error instanceof Error ? error.message : String(error);

            if (
              message.includes('55P03') &&
              message.includes('lock timeout')
            ) {
              return 'blocked';
            }

            throw error;
          },
        );

        expect(competing).toBe('blocked');
      } finally {
        releaseTransaction();
        await transaction;
      }
    } finally {
      await first.stripeSubscriptionSyncLock.deleteMany({
        where: { subscriptionId: id },
      });
    }
  });

});
