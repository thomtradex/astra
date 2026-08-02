import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('RBAC management (integration)', () => {
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

  it('allows admin to list roles', async () => {
    const { accessToken } = await login(
      app,
      'admin@alpha.test',
    );

    const response = await request(app.getHttpServer())
      .get(apiPath('/rbac/roles'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].permissions).toBeDefined();
  });

  it('allows admin to list permissions', async () => {
    const { accessToken } = await login(
      app,
      'admin@alpha.test',
    );

    const response = await request(app.getHttpServer())
      .get(apiPath('/rbac/permissions'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  it('denies viewer from managing RBAC', async () => {
    const { accessToken } = await login(
      app,
      'viewer@alpha.test',
    );

    await request(app.getHttpServer())
      .get(apiPath('/rbac/roles'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
