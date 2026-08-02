import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('RBAC audit (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    await seedIntegrationTestData(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('denies audit access without audit permission', async () => {
    const { accessToken } = await login(
      app,
      'viewer@alpha.test',
    );

    await request(app.getHttpServer())
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('allows admin to read audit logs', async () => {
    const { accessToken } = await login(
      app,
      'admin@alpha.test',
    );

    const response = await request(app.getHttpServer())
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.items).toBeDefined();
    expect(response.body.pagination).toBeDefined();
  });
});
