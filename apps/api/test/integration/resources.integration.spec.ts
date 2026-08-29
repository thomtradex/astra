import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf, TenantResource } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Resources (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgAlphaId: string;
  let orgBetaId: string;
  let alphaAdminToken: string;
  let alphaViewerToken: string;
  let _betaAdminToken: string;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);

    orgAlphaId = seed.organizationId;
    orgBetaId = seed.otherOrganizationId;

    alphaAdminToken = (await login(app, 'admin@alpha.test')).accessToken;

    alphaViewerToken = (await login(app, 'viewer@alpha.test')).accessToken;

    _betaAdminToken = (await login(app, 'admin@beta.test', 'TestPassword123!', 'org-beta')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('sites', () => {
    it('allows admin to create a site', async () => {
      const response = await apiRequest(app)
        .post(apiPath('/sites'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          name: 'Alpha Site',
          code: 'ALPHA-SITE-001',
        })
        .expect(201);

      expect(bodyOf<TenantResource>(response).organization_id).toBe(orgAlphaId);
    });

    it('denies viewer from creating a site', async () => {
      await apiRequest(app)
        .post(apiPath('/sites'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          name: 'Forbidden Site',
          code: 'FORBIDDEN-001',
        })
        .expect(403);
    });

    it('does not expose another organization site', async () => {
      await prisma.sites.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Beta Site',
          code: 'BETA-SITE-001',
          organization_id: orgBetaId,
          updated_at: new Date(),
        },
      });

      const response = await apiRequest(app)
        .get(apiPath('/sites'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);

      expect(
        bodyOf<Array<{ organization_id: string }>>(response).every(
          (site) => site.organization_id === orgAlphaId,
        ),
      ).toBe(true);
    });
  });

  describe('assets', () => {
    it('allows admin to create an asset', async () => {
      const response = await apiRequest(app)
        .post(apiPath('/assets'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          name: 'Alpha Asset',
          code: 'ALPHA-ASSET-001',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(bodyOf<TenantResource>(response).organization_id).toBe(orgAlphaId);
    });

    it('denies viewer from creating an asset', async () => {
      await apiRequest(app)
        .post(apiPath('/assets'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          name: 'Forbidden Asset',
          code: 'FORBIDDEN-ASSET-001',
        })
        .expect(403);
    });
  });

  describe('work orders', () => {
    it('allows admin to create a work order', async () => {
      const response = await apiRequest(app)
        .post(apiPath('/work-orders'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          title: 'Alpha Work Order',
          description: 'Test work order',
        })
        .expect(201);

      expect(bodyOf<TenantResource>(response).organization_id).toBe(orgAlphaId);
    });

    it('denies viewer from creating a work order', async () => {
      await apiRequest(app)
        .post(apiPath('/work-orders'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          title: 'Forbidden Work Order',
        })
        .expect(403);
    });

    it('does not expose another organization work orders', async () => {
      await prisma.work_orders.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Beta Work Order',
          organization_id: orgBetaId,
          updated_at: new Date(),
        },
      });

      const response = await apiRequest(app)
        .get(apiPath('/work-orders'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);

      expect(
        bodyOf<Array<{ organization_id: string }>>(response).every(
          (order) => order.organization_id === orgAlphaId,
        ),
      ).toBe(true);
    });
  });

  describe('maintenance', () => {
    it('denies viewer from creating a maintenance plan', async () => {
      await apiRequest(app)
        .post(apiPath('/maintenance'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          plan: 'Monthly inspection',
          assetId: 'missing',
          frequency: 'MONTHLY',
          nextDue: new Date().toISOString(),
        })
        .expect(403);
    });
  });

  describe('customers', () => {
    it('denies viewer from creating a customer', async () => {
      await apiRequest(app)
        .post(apiPath('/customers'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          code: 'CUSTOMER-001',
          name: 'Forbidden Customer',
        })
        .expect(403);
    });

    it('allows admin to create a customer', async () => {
      const response = await apiRequest(app)
        .post(apiPath('/customers'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          code: 'CUSTOMER-001',
          name: 'Alpha Customer',
        })
        .expect(201);

      expect(bodyOf<TenantResource>(response).organization_id).toBe(orgAlphaId);
    });
  });

  it('rejects unauthenticated resource access', async () => {
    await apiRequest(app).get(apiPath('/sites')).expect(401);

    await apiRequest(app).get(apiPath('/assets')).expect(401);

    await apiRequest(app).get(apiPath('/work-orders')).expect(401);

    await apiRequest(app).get(apiPath('/maintenance')).expect(401);
  });
});
