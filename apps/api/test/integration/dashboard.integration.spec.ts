import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

type DashboardOverview = {
  customers: number;
  sites: number;
  assets: number;
  workOrders: {
    open: number;
    highPriority: number;
  };
  generatedAt: string;
};

describe('Dashboard overview (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgAlphaId: string;
  let orgBetaId: string;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    const seedContext = await seedIntegrationTestData(prisma);
    orgAlphaId = seedContext.organizationId;
    orgBetaId = seedContext.otherOrganizationId;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('requires authentication', async () => {
    await apiRequest(app).get(apiPath('/dashboard/overview')).expect(401);
  });

  it('returns the dashboard overview for the authenticated organization', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    const response = await apiRequest(app)
      .get(apiPath('/dashboard/overview'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const body = bodyOf<DashboardOverview>(response);

    expect(body.customers).toBe(
      await prisma.customers.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(body.sites).toBe(
      await prisma.sites.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(body.assets).toBe(
      await prisma.assets.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(body.workOrders.open).toBe(
      await prisma.work_orders.count({
        where: {
          organization_id: orgAlphaId,
          status: 'OPEN',
        },
      }),
    );

    expect(body.workOrders.highPriority).toBe(
      await prisma.work_orders.count({
        where: {
          organization_id: orgAlphaId,
          priority: 'HIGH',
        },
      }),
    );

    expect(new Date(body.generatedAt).toString()).not.toBe('Invalid Date');
  });

  it('returns different organization-scoped results for Alpha and Beta', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');
    const betaAdmin = await login(app, 'admin@beta.test', 'TestPassword123!', 'org-beta');

    const alphaResponse = await apiRequest(app)
      .get(apiPath('/dashboard/overview'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const betaResponse = await apiRequest(app)
      .get(apiPath('/dashboard/overview'))
      .set('Authorization', `Bearer ${betaAdmin.accessToken}`)
      .expect(200);

    const alpha = bodyOf<DashboardOverview>(alphaResponse);
    const beta = bodyOf<DashboardOverview>(betaResponse);

    expect(alpha.customers).toBe(
      await prisma.customers.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(beta.customers).toBe(
      await prisma.customers.count({
        where: { organization_id: orgBetaId },
      }),
    );

    expect(alpha.sites).toBe(
      await prisma.sites.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(beta.sites).toBe(
      await prisma.sites.count({
        where: { organization_id: orgBetaId },
      }),
    );

    expect(alpha.assets).toBe(
      await prisma.assets.count({
        where: { organization_id: orgAlphaId },
      }),
    );

    expect(beta.assets).toBe(
      await prisma.assets.count({
        where: { organization_id: orgBetaId },
      }),
    );

    expect(alpha.workOrders.open).toBe(
      await prisma.work_orders.count({
        where: {
          organization_id: orgAlphaId,
          status: 'OPEN',
        },
      }),
    );

    expect(beta.workOrders.open).toBe(
      await prisma.work_orders.count({
        where: {
          organization_id: orgBetaId,
          status: 'OPEN',
        },
      }),
    );
  });
});
