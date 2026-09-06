import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf, LoginResponse, MeResponse } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData, TEST_PASSWORD } from '../helpers/test-data';

describe('Auth (integration)', () => {
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

  it('logs in with valid credentials', async () => {
    const response = await apiRequest(app)
      .post(apiPath('/auth/login'))
      .send({ email: 'admin@alpha.test', password: TEST_PASSWORD })
      .expect(200);

    expect(bodyOf<LoginResponse>(response).accessToken).toBeDefined();
    expect(bodyOf<LoginResponse>(response).refreshToken).toBeDefined();
    expect(bodyOf<LoginResponse>(response).expiresIn).toBeGreaterThan(0);
  });

  it('rejects invalid credentials', async () => {
    await apiRequest(app)
      .post(apiPath('/auth/login'))
      .send({ email: 'admin@alpha.test', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the authenticated profile', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await apiRequest(app)
      .get(apiPath('/auth/me'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf<MeResponse>(response).email).toBe('admin@alpha.test');
    expect(bodyOf<MeResponse>(response).organizationId).toBeDefined();
    expect(bodyOf<MeResponse>(response).permissions.length).toBeGreaterThan(0);
  });

  it('rotates refresh tokens', async () => {
    const initial = await login(app, 'viewer@alpha.test');

    const refreshed = await apiRequest(app)
      .post(apiPath('/auth/refresh'))
      .send({ refreshToken: initial.refreshToken })
      .expect(200);

    const refreshedBody = bodyOf<LoginResponse>(refreshed);
    expect(refreshedBody.accessToken).toBeDefined();
    expect(refreshedBody.refreshToken).not.toBe(initial.refreshToken);

    await apiRequest(app)
      .post(apiPath('/auth/refresh'))
      .send({ refreshToken: initial.refreshToken })
      .expect(401);
  });

  it('requires organization slug when email exists in multiple organizations', async () => {
    const role = await prisma.role.findFirstOrThrow({ where: { name: 'ADMIN' } });
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const sharedEmail = 'duplicated@test.local';

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Dup',
        lastName: 'Alpha',
        organizationId: (
          await prisma.organization.findFirstOrThrow({ where: { slug: 'org-alpha' } })
        ).id,
        roles: { create: { roleId: role.id } },
      },
    });

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Dup',
        lastName: 'Beta',
        organizationId: (
          await prisma.organization.findFirstOrThrow({ where: { slug: 'org-beta' } })
        ).id,
        roles: { create: { roleId: role.id } },
      },
    });

    await apiRequest(app)
      .post(apiPath('/auth/login'))
      .send({ email: sharedEmail, password: TEST_PASSWORD })
      .expect(401);

    const alphaLogin = await apiRequest(app)
      .post(apiPath('/auth/login'))
      .send({ email: sharedEmail, password: TEST_PASSWORD, organizationSlug: 'org-alpha' })
      .expect(200);

    const alphaLoginBody = bodyOf<LoginResponse>(alphaLogin);
    expect(alphaLoginBody.accessToken).toBeDefined();
  });
});
