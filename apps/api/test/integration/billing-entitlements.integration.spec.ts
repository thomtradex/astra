import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { apiPath, createTestApp } from '../helpers/test-app';
import {
  login,
  seedIntegrationTestData,
} from '../helpers/test-data';

describe('Billing entitlements (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let organizationId: string;
  let alphaAdminToken: string;

  beforeAll(async () => {
    const context = await createTestApp();

    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);

    organizationId = seed.organizationId;

    alphaAdminToken = (
      await login(app, 'admin@alpha.test')
    ).accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function setPlan(
    code: string,
    features: Record<string, boolean>,
  ) {
    const now = new Date();

    const plan = await prisma.billingPlan.upsert({
      where: { code },
      update: {
        isActive: true,
        features,
        limits: {},
      },
      create: {
        code,
        name: code,
        description: 'Billing entitlement integration test',
        monthlyPriceCents: 0,
        currency: 'EUR',
        trialDays: 0,
        isActive: true,
        displayOrder: 999,
        features,
        limits: {},
      },
    });

    await prisma.subscription.deleteMany({
      where: { organizationId },
    });

    await prisma.subscription.create({
      data: {
        organizationId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: new Date('2099-12-31T23:59:59.999Z'),
        cancelAtPeriodEnd: false,
      },
    });

    const activeSubscription = await prisma.subscription.findFirstOrThrow({
      where: {
        organizationId,
      },
      include: {
        plan: true,
      },
    });

    if (activeSubscription.plan.code !== code) {
      throw new Error(
        `Billing test setup failed: expected ${code}, got ${activeSubscription.plan.code}`,
      );
    }
  }

  it('blocks intelligence when the organization plan does not include it', async () => {
    await setPlan('TEST_BILLING_NO_INTELLIGENCE', {
      intelligence: false,
      workOrderManagement: true,
    });

    await apiRequest(app)
      .get(apiPath('/intelligence/briefing'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(400);
  });

  it('allows intelligence when the organization plan includes it', async () => {
    await setPlan('TEST_BILLING_WITH_INTELLIGENCE', {
      intelligence: true,
      workOrderManagement: true,
    });

    await apiRequest(app)
      .get(apiPath('/intelligence/briefing'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(200);
  });

  it('enforces the class-level work order billing gate', async () => {
    await setPlan('TEST_BILLING_NO_WORK_ORDERS', {
      intelligence: true,
      workOrderManagement: false,
    });

    await apiRequest(app)
      .get(apiPath('/work-orders'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(400);
  });

  it('allows class-level work order access when the feature is enabled', async () => {
    await setPlan('TEST_BILLING_WITH_WORK_ORDERS', {
      intelligence: true,
      workOrderManagement: true,
    });

    await apiRequest(app)
      .get(apiPath('/work-orders'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(200);
  });
});
