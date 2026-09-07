import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Billing authorization (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    await seedIntegrationTestData(prisma);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('denies billing mutation without billing permission', async () => {
    const { accessToken } = await login(app, 'viewer@alpha.test');

    await apiRequest(app)
      .post(apiPath('/billing/free'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('allows billing mutation with billing permission', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    await apiRequest(app)
      .post(apiPath('/billing/free'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
  });
});
