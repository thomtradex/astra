import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PrismaClient } from '@astra/database';

import { BillingService } from '../../src/modules/billing/billing.service';

const integrationEnabled =
  process.env.ASTRA_BILLING_FREE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

describeIntegration('BillingService FREE concurrency — isolated PostgreSQL', () => {
  let prisma: PrismaClient;
  let organizationId: string | undefined;
  let planId: string | undefined;
  let createdPlan = false;

  const suffix = randomUUID().slice(0, 12);

  beforeAll(async () => {
    const raw = process.env.TEST_DATABASE_URL;

    if (!raw) {
      throw new Error('TEST_DATABASE_URL ausente no ambiente Jest.');
    }

    const url = new URL(raw);

    if (
      !['postgres:', 'postgresql:'].includes(url.protocol) ||
      url.hostname !== '127.0.0.1' ||
      url.port !== '55432' ||
      url.pathname !== '/astra_stripe_test' ||
      decodeURIComponent(url.username) !== 'astra_stripe_test'
    ) {
      throw new Error('Base de dados não autorizada.');
    }

    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = raw;
    process.env.TEST_DATABASE_URL = raw;
    process.env.STRIPE_WORKER_ENABLED = 'false';

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: raw,
        },
      },
    });

    const identity = await prisma.$queryRaw<
      Array<{ database: string; username: string }>
    >`
      SELECT
        current_database() AS database,
        current_user AS username
    `;

    if (
      identity.length !== 1 ||
      identity[0]?.database !== 'astra_stripe_test' ||
      identity[0]?.username !== 'astra_stripe_test'
    ) {
      throw new Error('Identidade PostgreSQL inesperada.');
    }

    const existingFree = await prisma.billingPlan.findUnique({
      where: { code: 'FREE' },
    });

    if (existingFree) {
      if (!existingFree.isActive || existingFree.monthlyPriceCents !== 0) {
        throw new Error('Plano FREE preexistente inválido para este teste.');
      }

      planId = existingFree.id;
    } else {
      const plan = await prisma.billingPlan.create({
        data: {
          code: 'FREE',
          name: 'Free',
          description: 'Plano FREE temporário para teste isolado.',
          monthlyPriceCents: 0,
          currency: 'EUR',
          trialDays: 0,
          displayOrder: 0,
          isActive: true,
          limits: { users: 2 },
          features: { dashboard: true },
        },
      });

      planId = plan.id;
      createdPlan = true;
    }

    const organization = await prisma.organization.create({
      data: {
        name: 'Billing FREE Concurrency Test',
        slug: 'billing-free-concurrency-' + suffix,
      },
    });

    organizationId = organization.id;
  });

  afterAll(async () => {
    if (!prisma) return;

    try {
      if (organizationId) {
        await prisma.subscription.deleteMany({
          where: { organizationId },
        });

        await prisma.organization.delete({
          where: { id: organizationId },
        });
      }

      if (createdPlan && planId) {
        const references = await prisma.subscription.count({
          where: { planId },
        });

        if (references !== 0) {
          throw new Error('Plano temporário ainda referenciado.');
        }

        await prisma.billingPlan.delete({
          where: { id: planId },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it('returns one subscription for two concurrent activations', async () => {
    if (!organizationId) {
      throw new Error('Organização temporária ausente.');
    }

    const paymentProvider = {} as ConstructorParameters<
      typeof BillingService
    >[1];

    const service = new BillingService(
      prisma as ConstructorParameters<typeof BillingService>[0],
      paymentProvider,
    );

    const results = await Promise.all([
      service.ensureFreeSubscription(organizationId),
      service.ensureFreeSubscription(organizationId),
    ]);

    const subscriptions = await prisma.subscription.findMany({
      where: { organizationId },
    });

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(results[1].id);
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]?.id).toBe(results[0]?.id);
    expect(subscriptions[0]?.planId).toBe(planId);
  });
});
