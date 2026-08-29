import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf, CountResponse } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Resource CRUD tenant isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let _orgAlphaId: string;
  let orgBetaId: string;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);
    _orgAlphaId = seed.organizationId;
    orgBetaId = seed.otherOrganizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not allow Alpha to update or delete Beta assets', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    const betaAsset = await prisma.assets.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Beta Asset',
        code: 'BETA-ASSET-001',
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    await apiRequest(app)
      .patch(apiPath(`/assets/${betaAsset.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .send({ name: 'Hacked Asset' })
      .expect(404);

    await apiRequest(app)
      .delete(apiPath(`/assets/${betaAsset.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(404);

    const unchanged = await prisma.assets.findUnique({
      where: { id: betaAsset.id },
    });

    expect(unchanged?.name).toBe('Beta Asset');
  });

  it('does not allow Alpha to update or delete Beta sites', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    const betaSite = await prisma.sites.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Beta Site',
        code: 'BETA-SITE-001',
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    await apiRequest(app)
      .patch(apiPath(`/sites/${betaSite.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .send({ name: 'Hacked Site' })
      .expect(404);

    await apiRequest(app)
      .delete(apiPath(`/sites/${betaSite.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(404);

    const unchanged = await prisma.sites.findUnique({
      where: { id: betaSite.id },
    });

    expect(unchanged?.name).toBe('Beta Site');
  });

  it('does not allow Alpha to update or delete Beta work orders', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    const betaWorkOrder = await prisma.work_orders.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Beta Work Order',
        organization_id: orgBetaId,
        updated_at: new Date(),
      },
    });

    const updateResponse = await apiRequest(app)
      .patch(apiPath(`/work-orders/${betaWorkOrder.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .send({ title: 'Hacked Work Order' })
      .expect([200,404]);

    expect(bodyOf<CountResponse>(updateResponse).count).toBe(0);

    const deleteResponse = await apiRequest(app)
      .delete(apiPath(`/work-orders/${betaWorkOrder.id}`))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect([200,404]);

    expect(bodyOf<CountResponse>(deleteResponse).count).toBe(0);

    const unchanged = await prisma.work_orders.findUnique({
      where: { id: betaWorkOrder.id },
    });

    expect(unchanged?.title).toBe('Beta Work Order');
    expect(unchanged?.organization_id).toBe(orgBetaId);
  });
});
