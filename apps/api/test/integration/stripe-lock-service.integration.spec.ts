import { PrismaClient } from '@astra/database';
import { randomUUID } from 'node:crypto';
import { StripeSubscriptionSyncLockService } from '../../src/modules/billing/webhooks/stripe-subscription-sync-lock.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { withSerializableRetry } from '../../src/modules/procurement/utils/serializable-retry';
import { requireIsolatedTestDatabase } from '../require-isolated-test-database';

describe('Stripe lock service — real PostgreSQL', () => {
  let prisma: PrismaClient;
  let service: StripeSubscriptionSyncLockService;

  const ids: string[] = [];

  beforeAll(async () => {
    const url = requireIsolatedTestDatabase();
    const parsed = new URL(url);

    if (
      parsed.protocol !== 'postgresql:' ||
      parsed.hostname !== '127.0.0.1' ||
      parsed.port !== '55432' ||
      parsed.pathname !== '/astra_stripe_test' ||
      parsed.searchParams.get('schema') !== 'public'
    ) {
      throw new Error('Unexpected integration database');
    }

    prisma = new PrismaClient({
      datasources: { db: { url } },
    });

    await prisma.$connect();

    service = new StripeSubscriptionSyncLockService(
      prisma as PrismaService,
    );
  });

  afterAll(async () => {
    if (prisma) {
      try {
        if (ids.length) {
          await prisma.stripeSubscriptionSyncLock.deleteMany({
            where: { subscriptionId: { in: ids } },
          });
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  });

  function newId() {
    const id = 'sub_service_it_' + randomUUID();
    ids.push(id);
    return id;
  }

  it('renews a valid lease', async () => {
    const id = newId();
    const claim = await service.acquire(id);

    expect(claim).not.toBeNull();
    expect(await service.renew(claim!)).toBe(true);
    expect(await service.release(claim!)).toBe(true);
  });

  it('rejects renewal after expiry', async () => {
    const id = newId();
    const claim = await service.acquire(id);

    expect(claim).not.toBeNull();

    await prisma.stripeSubscriptionSyncLock.update({
      where: { subscriptionId: id },
      data: {
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    expect(await service.renew(claim!)).toBe(false);
  });

  it('rejects a stale owner after takeover', async () => {
    const id = newId();

    const oldClaim = await service.acquire(id);
    expect(oldClaim).not.toBeNull();

    await prisma.stripeSubscriptionSyncLock.update({
      where: { subscriptionId: id },
      data: {
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const newClaim = await service.acquire(id);

    expect(newClaim).not.toBeNull();
    expect(newClaim!.generation).toBeGreaterThan(
      oldClaim!.generation,
    );

    expect(await service.renew(oldClaim!)).toBe(false);
    expect(await service.release(oldClaim!)).toBe(false);

    await expect(
      prisma.$transaction(async (tx) => {
        await service.assertOwnershipInTransaction(
          tx,
          oldClaim!,
        );
      }),
    ).rejects.toThrow();

    expect(await service.release(newClaim!)).toBe(true);
  });

  it('allows only one concurrent service owner across Prisma clients', async () => {
    const id = newId();
    const url = requireIsolatedTestDatabase();

    const secondPrisma = new PrismaClient({
      datasources: { db: { url } },
    });

    await secondPrisma.$connect();

    const secondService = new StripeSubscriptionSyncLockService(
      secondPrisma as PrismaService,
    );

    try {
      const [firstClaim, secondClaim] = await Promise.all([
        service.acquire(id),
        secondService.acquire(id),
      ]);

      const claims = [firstClaim, secondClaim].filter(
        (claim) => claim !== null,
      );

      expect(claims).toHaveLength(1);

      const winner = firstClaim ? service : secondService;
      const loser = firstClaim ? secondService : service;
      const winningClaim = firstClaim ?? secondClaim;

      expect(winningClaim).not.toBeNull();

      expect(await loser.acquire(id)).toBeNull();

      expect(await winner.release(winningClaim!)).toBe(true);

      const nextClaim = await loser.acquire(id);

      expect(nextClaim).not.toBeNull();
      expect(nextClaim!.generation).toBeGreaterThan(
        winningClaim!.generation,
      );

      expect(await winner.renew(winningClaim!)).toBe(false);
      expect(await winner.release(winningClaim!)).toBe(false);

      expect(await loser.release(nextClaim!)).toBe(true);
    } finally {
      await secondPrisma.$disconnect();
    }
  });


  it('fences a serializable transaction against competing renewal', async () => {
    const id = newId();
    const claim = await service.acquire(id);

    expect(claim).not.toBeNull();

    const secondPrisma = new PrismaClient({
      datasources: {
        db: { url: requireIsolatedTestDatabase() },
      },
    });

    await secondPrisma.$connect();

    const secondService = new StripeSubscriptionSyncLockService(
      secondPrisma as PrismaService,
    );

    let signalReady!: () => void;
    let signalFinish!: () => void;

    const ready = new Promise<void>((resolve) => {
      signalReady = resolve;
    });

    const finish = new Promise<void>((resolve) => {
      signalFinish = resolve;
    });

    let transaction: Promise<void> | undefined;

    try {
      transaction = prisma.$transaction(
        async (tx) => {
          await service.assertOwnershipInTransaction(tx, claim!);

          signalReady();
          await finish;
        },
        {
          isolationLevel: 'Serializable',
          timeout: 10000,
        },
      );

      await ready;

      await expect(
        secondPrisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(
            "SET LOCAL lock_timeout = '300ms'",
          );

          await tx.stripeSubscriptionSyncLock.updateMany({
            where: {
              subscriptionId: id,
              claimToken: claim!.token,
              generation: claim!.generation,
            },
            data: {
              updatedAt: new Date(),
            },
          });
        }),
      ).rejects.toThrow();

      signalFinish();
      await transaction;

      expect(await secondService.renew(claim!)).toBe(true);
      expect(await service.release(claim!)).toBe(true);
    } finally {
      signalFinish();

      if (transaction) {
        await transaction.catch(() => undefined);
      }

      await secondPrisma.$disconnect();
    }
  });


  it('detects heartbeat renewal contention during serializable fencing', async () => {
    const id = newId();
    const claim = await service.acquire(id);

    expect(claim).not.toBeNull();

    const secondPrisma = new PrismaClient({
      datasources: {
        db: { url: requireIsolatedTestDatabase() },
      },
    });

    await secondPrisma.$connect();

    const secondService = new StripeSubscriptionSyncLockService(
      secondPrisma as PrismaService,
    );

    let signalReady!: () => void;
    let signalFinish!: () => void;

    const ready = new Promise<void>((resolve) => {
      signalReady = resolve;
    });

    const finish = new Promise<void>((resolve) => {
      signalFinish = resolve;
    });

    let transaction: Promise<void> | undefined;

    try {
      transaction = prisma.$transaction(
        async (tx) => {
          await service.assertOwnershipInTransaction(tx, claim!);
          signalReady();
          await finish;
        },
        {
          isolationLevel: 'Serializable',
          timeout: 10000,
        },
      );

      await ready;

      // Limite aplicado à ligação que executará renew().
      await secondPrisma.$executeRawUnsafe(
        "SET lock_timeout = '300ms'",
      );

      try {
        await expect(
          secondService.renew(claim!),
        ).rejects.toThrow();
      } finally {
        await secondPrisma.$executeRawUnsafe(
          "RESET lock_timeout",
        );
      }

      signalFinish();
      await transaction;

      expect(await secondService.renew(claim!)).toBe(true);
      expect(await service.release(claim!)).toBe(true);
    } finally {
      signalFinish();

      if (transaction) {
        await transaction.catch(() => undefined);
      }

      await secondPrisma.$disconnect();
    }
  });


  it('revalidates fencing after a real serializable conflict', async () => {
    const id = newId();
    const claim = await service.acquire(id);

    expect(claim).not.toBeNull();

    const secondPrisma = new PrismaClient({
      datasources: {
        db: { url: requireIsolatedTestDatabase() },
      },
    });

    await secondPrisma.$connect();

    let attempts = 0;
    let fencingChecks = 0;

    try {
      const result = await withSerializableRetry(
        prisma as PrismaService,
        async (tx) => {
          attempts++;

          if (attempts === 1) {
            await tx.stripeSubscriptionSyncLock.findUniqueOrThrow({
              where: { subscriptionId: id },
            });

            await secondPrisma.stripeSubscriptionSyncLock.update({
              where: { subscriptionId: id },
              data: { updatedAt: new Date() },
            });
          }

          await service.assertOwnershipInTransaction(tx, claim!);
          fencingChecks++;

          return 'synchronized';
        },
      );

      expect(result).toBe('synchronized');
      expect(attempts).toBe(2);
      expect(fencingChecks).toBe(1);

      expect(await service.release(claim!)).toBe(true);
    } finally {
      await secondPrisma.$disconnect();
    }
  });


  it('prevents stale worker actions after cross-client takeover', async () => {
    const id = newId();

    const secondPrisma = new PrismaClient({
      datasources: {
        db: { url: requireIsolatedTestDatabase() },
      },
    });

    await secondPrisma.$connect();

    const secondService = new StripeSubscriptionSyncLockService(
      secondPrisma as PrismaService,
    );

    try {
      const oldClaim = await service.acquire(id);

      expect(oldClaim).not.toBeNull();

      await prisma.stripeSubscriptionSyncLock.update({
        where: { subscriptionId: id },
        data: {
          expiresAt: new Date(Date.now() - 60_000),
        },
      });

      const newClaim = await secondService.acquire(id);

      expect(newClaim).not.toBeNull();
      expect(newClaim!.token).not.toBe(oldClaim!.token);
      expect(newClaim!.generation).toBeGreaterThan(
        oldClaim!.generation,
      );

      expect(await service.renew(oldClaim!)).toBe(false);
      expect(await service.release(oldClaim!)).toBe(false);

      await expect(
        prisma.$transaction(async (tx) => {
          await service.assertOwnershipInTransaction(
            tx,
            oldClaim!,
          );
        }),
      ).rejects.toThrow(
        'Stripe subscription synchronization claim is no longer valid',
      );

      expect(await secondService.renew(newClaim!)).toBe(true);

      await expect(
        secondPrisma.$transaction(async (tx) => {
          await secondService.assertOwnershipInTransaction(
            tx,
            newClaim!,
          );
        }),
      ).resolves.toBeUndefined();

      expect(await secondService.release(newClaim!)).toBe(true);

      const row = await prisma.stripeSubscriptionSyncLock.findUniqueOrThrow({
        where: { subscriptionId: id },
      });

      expect(row.claimToken).toBeNull();
      expect(row.expiresAt).toBeNull();
      expect(row.generation).toBe(newClaim!.generation);
    } finally {
      await secondPrisma.$disconnect();
    }
  });

});
