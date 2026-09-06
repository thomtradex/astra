import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf, PaginatedResponse } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Tenant isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgAlphaId: string;
  let orgBetaId: string;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prisma = context.prisma;

    const seedContext = await seedIntegrationTestData(prisma);
    orgAlphaId = seedContext.organizationId;
    orgBetaId = seedContext.otherOrganizationId;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns only users from the authenticated organization', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');
    const betaAdmin = await login(app, 'admin@beta.test', 'TestPassword123!', 'org-beta');

    const alphaResponse = await apiRequest(app)
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const betaResponse = await apiRequest(app)
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${betaAdmin.accessToken}`)
      .expect(200);

    expect(
      bodyOf<PaginatedResponse<{ email: string }>>(alphaResponse).items.every((user) =>
        user.email.endsWith('@alpha.test'),
      ),
    ).toBe(true);
    expect(
      bodyOf<PaginatedResponse<{ email: string }>>(betaResponse).items.every((user) =>
        user.email.endsWith('@beta.test'),
      ),
    ).toBe(true);
    expect(
      bodyOf<PaginatedResponse<{ email: string }>>(alphaResponse).items.some((user) =>
        user.email.endsWith('@beta.test'),
      ),
    ).toBe(false);
  });

  it('scopes audit logs to the authenticated organization', async () => {
    const alphaAdmin = await login(app, 'admin@alpha.test');

    await apiRequest(app)
      .get(apiPath('/users'))
      .set('Authorization', `Bearer ${alphaAdmin.accessToken}`)
      .expect(200);

    const auditResponse = await apiRequest(app)
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
    expect(
      bodyOf<PaginatedResponse<{ organizationId: string }>>(auditResponse).items.every(
        (log) => log.organizationId === orgAlphaId,
      ),
    ).toBe(true);
    expect(
      betaAuditLogs.every((log: { organizationId: string }) => log.organizationId === orgBetaId),
    ).toBe(true);
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
