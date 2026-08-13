import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf, PaginatedResponse } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('RBAC (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;
    await seedIntegrationTestData(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('denies access when permission is missing', async () => {
    const { accessToken } = await login(app, 'viewer@alpha.test');

    await apiRequest(app)
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('allows access when permission is present', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await apiRequest(app)
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf<PaginatedResponse<Record<string, unknown>>>(response).items).toBeDefined();
    expect(bodyOf<PaginatedResponse<Record<string, unknown>>>(response).pagination).toBeDefined();
  });

  it('denies by default when endpoint has no authorization metadata', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    await apiRequest(app)
      .get(apiPath('/test-harness/unprotected'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('paginates list endpoints', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await apiRequest(app)
      .get(apiPath('/users?page=1&limit=1'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf<PaginatedResponse<Record<string, unknown>>>(response).items).toHaveLength(1);
    expect(bodyOf<PaginatedResponse<Record<string, unknown>>>(response).pagination.page).toBe(1);
    expect(bodyOf<PaginatedResponse<Record<string, unknown>>>(response).pagination.limit).toBe(1);
    expect(
      bodyOf<PaginatedResponse<Record<string, unknown>>>(response).pagination.total,
    ).toBeGreaterThan(1);
  });
});
