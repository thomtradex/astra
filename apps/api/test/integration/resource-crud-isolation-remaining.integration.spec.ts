import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Remaining resource tenant isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgBetaId: string;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);
    orgBetaId = seed.otherOrganizationId;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('does not allow Alpha to access a Beta maintenance plan', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    const betaAsset = await prisma.assets.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Beta Maintenance Asset',
        code: 'BETA-MAINT-ASSET-001',
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    const betaPlan = await prisma.maintenance_plans.create({
      data: {
        id: crypto.randomUUID(),
        plan: 'Beta Maintenance Plan',
        assetId: betaAsset.id,
        frequency: 'MONTHLY',
        nextDue: new Date(),
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    await apiRequest(app)
      .get(apiPath(`/maintenance/${betaPlan.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(404);

    await apiRequest(app)
      .post(apiPath('/maintenance'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .send({
        plan: 'Cross Tenant Plan',
        assetId: betaAsset.id,
        frequency: 'MONTHLY',
        nextDue: new Date().toISOString(),
      })
      .expect(404);
  });

  it('does not expose Beta customers to Alpha', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    await prisma.customers.create({
      data: {
        id: crypto.randomUUID(),
        code: 'BETA-CUSTOMER-001',
        name: 'Beta Customer',
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    const response = await apiRequest(app)
      .get(apiPath('/customers'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    expect(
      bodyOf<{ items: { code: string }[] }>(response).items.some(
        (customer) => customer.code === 'BETA-CUSTOMER-001',
      ),
    ).toBe(false);
  });
});
