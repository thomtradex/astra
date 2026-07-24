import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData, TEST_PASSWORD } from '../helpers/test-data';

describe('Auth (integration)', () => {
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

  it('logs in with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email: 'admin@alpha.test', password: TEST_PASSWORD })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.expiresIn).toBeGreaterThan(0);
  });

  it('rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email: 'admin@alpha.test', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the authenticated profile', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await request(app.getHttpServer())
      .get(apiPath('/auth/me'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe('admin@alpha.test');
    expect(response.body.organizationId).toBeDefined();
    expect(response.body.permissions.length).toBeGreaterThan(0);
  });

  it('rotates refresh tokens', async () => {
    const initial = await login(app, 'viewer@alpha.test');

    const refreshed = await request(app.getHttpServer())
      .post(apiPath('/auth/refresh'))
      .send({ refreshToken: initial.refreshToken })
      .expect(200);

    expect(refreshed.body.accessToken).toBeDefined();
    expect(refreshed.body.refreshToken).not.toBe(initial.refreshToken);

    await request(app.getHttpServer())
      .post(apiPath('/auth/refresh'))
      .send({ refreshToken: initial.refreshToken })
      .expect(401);
  });

  it('requires organization slug when email exists in multiple organizations', async () => {
    const role = await prisma.role.findFirstOrThrow({ where: { name: 'ADMIN' } });
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const sharedEmail = 'duplicated@test';

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Dup',
        lastName: 'Alpha',
        organizationId: (await prisma.organization.findFirstOrThrow({ where: { slug: 'org-alpha' } })).id,
        roles: { create: { roleId: role.id } },
      },
    });

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Dup',
        lastName: 'Beta',
        organizationId: (await prisma.organization.findFirstOrThrow({ where: { slug: 'org-beta' } })).id,
        roles: { create: { roleId: role.id } },
      },
    });

    await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email: sharedEmail, password: TEST_PASSWORD })
      .expect(401);

    const alphaLogin = await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email: sharedEmail, password: TEST_PASSWORD, organizationSlug: 'org-alpha' })
      .expect(200);

    expect(alphaLogin.body.accessToken).toBeDefined();
  });
});
