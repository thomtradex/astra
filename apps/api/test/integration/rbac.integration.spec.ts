import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('RBAC (integration)', () => {
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

  it('denies access when permission is missing', async () => {
    const { accessToken } = await login(app, 'viewer@alpha.test');

    await request(app.getHttpServer())
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('allows access when permission is present', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await request(app.getHttpServer())
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.items).toBeDefined();
    expect(response.body.pagination).toBeDefined();
  });

  it('denies by default when endpoint has no authorization metadata', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    await request(app.getHttpServer())
      .get(apiPath('/test-harness/unprotected'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('paginates list endpoints', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await request(app.getHttpServer())
      .get(apiPath('/users?page=1&limit=1'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(1);
    expect(response.body.pagination.total).toBeGreaterThan(1);
  });
});
