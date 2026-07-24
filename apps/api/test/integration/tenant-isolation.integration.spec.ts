import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Tenant isolation (integration)', () => {
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

  it('returns only users from the authenticated organization', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');
    const betaAdmin = await login(app, 'admin@beta.test');

    const alphaResponse = await request(app.getHttpServer())
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const betaResponse = await request(app.getHttpServer())
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${betaAdmin.accessToken}`)
      .expect(200);

    expect(alphaResponse.body.items.every((user: { email: string }) => user.email.endsWith('@alpha.test'))).toBe(true);
    expect(betaResponse.body.items.every((user: { email: string }) => user.email.endsWith('@beta.test'))).toBe(true);
    expect(alphaResponse.body.items.some((user: { email: string }) => user.email.endsWith('@beta.test'))).toBe(false);
  });

  it('scopes audit logs to the authenticated organization', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    await request(app.getHttpServer())
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const auditResponse = await request(app.getHttpServer())
      .get(apiPath('/audit'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const alphaAuditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgAlphaId },
    });
    const betaAuditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgBetaId },
    });

    expect(alphaAuditLogs.length).toBeGreaterThan(0);
    expect(auditResponse.body.items.every((log: { organizationId: string }) => log.organizationId === orgAlphaId)).toBe(true);
    expect(betaAuditLogs.every((log) => log.organizationId === orgBetaId)).toBe(true);
  });

  it('allows the same email in different organizations', async () => {
    const sharedEmail = 'shared.user@test';

    const role = await prisma.role.findFirstOrThrow({ where: { name: 'ADMIN' } });
    const passwordHash = '$2a$10$placeholder';

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Shared',
        lastName: 'Alpha',
        organizationId: orgAlphaId,
        roles: { create: { roleId: role.id } },
      },
    });

    await prisma.user.create({
      data: {
        email: sharedEmail,
        passwordHash,
        firstName: 'Shared',
        lastName: 'Beta',
        organizationId: orgBetaId,
        roles: { create: { roleId: role.id } },
      },
    });

    const users = await prisma.user.findMany({ where: { email: sharedEmail } });
    expect(users).toHaveLength(2);
    expect(new Set(users.map((user) => user.organizationId)).size).toBe(2);
  });
});
