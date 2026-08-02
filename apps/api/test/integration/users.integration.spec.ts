import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import {
  login,
  seedIntegrationTestData,
  TEST_PASSWORD,
} from '../helpers/test-data';

describe('Users management (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgAlphaId: string;
  let orgBetaId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const context = await seedIntegrationTestData(prisma);

    orgAlphaId = context.organizationId;
    orgBetaId = context.otherOrganizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows admin to create users inside its organization', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const response = await request(app.getHttpServer())
      .post(apiPath('/users'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'New',
        lastName: 'User',
        email: 'new@alpha.test',
        password: TEST_PASSWORD,
      })
      .expect(201);

    expect(response.body.email).toBe('new@alpha.test');
    expect(response.body.organizationId).toBe(orgAlphaId);
  });

  it('denies user creation without USER_WRITE permission', async () => {
    const { accessToken } = await login(app, 'viewer@alpha.test');

    await request(app.getHttpServer())
      .post(apiPath('/users'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Blocked',
        lastName: 'User',
        email: 'blocked@alpha.test',
        password: TEST_PASSWORD,
      })
      .expect(403);
  });

  it('prevents cross organization user updates', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const betaUser = await prisma.user.findFirstOrThrow({
      where: {
        organizationId: orgBetaId,
        email: 'admin@beta.test',
      },
    });

    await request(app.getHttpServer())
      .patch(apiPath(`/users/${betaUser.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Hacked',
      })
      .expect(404);
  });

  it('allows admin to update own organization user', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const user = await prisma.user.findFirstOrThrow({
      where: {
        organizationId: orgAlphaId,
        email: 'viewer@alpha.test',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(apiPath(`/users/${user.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Updated',
      })
      .expect(200);

    expect(response.body.firstName).toBe('Updated');
  });

  it('soft deletes users instead of removing records', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const user = await prisma.user.findFirstOrThrow({
      where: {
        organizationId: orgAlphaId,
        email: 'viewer@alpha.test',
      },
    });

    await request(app.getHttpServer())
      .delete(apiPath(`/users/${user.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const deletedUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
    });

    expect(deletedUser.isActive).toBe(false);
  });
});
