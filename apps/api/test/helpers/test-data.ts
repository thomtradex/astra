import { PERMISSIONS, SYSTEM_ROLES } from '@astra/shared';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';

import type { LoginResponse } from './http-types';
import { apiPath } from './test-app';

export const TEST_PASSWORD = 'TestPassword123!';

export interface TestTenantContext {
  organizationId: string;
  adminUserId: string;
  viewerUserId: string;
  otherOrganizationId: string;
}

async function ensurePermission(prisma: PrismaService, name: string): Promise<string> {
  const permission = await prisma.permission.upsert({
    where: { name },
    update: {},
    create: { name, description: name },
  });
  return permission.id;
}

async function ensureRoleWithPermissions(
  prisma: PrismaService,
  roleName: string,
  permissions: string[],
): Promise<string> {
  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName, description: roleName, isSystem: true },
  });

  for (const permissionName of permissions) {
    const permissionId = await ensurePermission(prisma, permissionName);
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId,
      },
    });
  }

  return role.id;
}

export async function createUserWithRole(
  prisma: PrismaService,
  organizationId: string,
  email: string,
  firstName: string,
  roleId: string,
): Promise<string> {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId,
        email,
      },
    },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      firstName,
      lastName: 'Test',
      organizationId,
      roles: {
        create: {
          roleId,
        },
      },
    },
  });

  return user.id;
}

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}



export async function seedBillingPlans(prisma: PrismaService): Promise<void> {
  await prisma.billingPlan.upsert({
    where: {
      code: 'STARTER',
    },
    update: {
      isActive: true,
    },
    create: {
      code: 'STARTER',
      name: 'Starter',
      description: 'Starter plan',
      monthlyPriceCents: 0,
      currency: 'EUR',
      trialDays: 14,
      isActive: true,
      displayOrder: 1,
      features: {},
      limits: {},
    },
  });
}

export async function seedRolesAndPermissions(
  prisma: PrismaService,
): Promise<{ adminRoleId: string; viewerRoleId: string }> {
  const adminRoleId = await ensureRoleWithPermissions(
    prisma,
    SYSTEM_ROLES.ADMIN,
    Object.values(PERMISSIONS),
  );

  const viewerRoleId = await ensureRoleWithPermissions(prisma, SYSTEM_ROLES.VIEWER, [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ORG_READ,
  ]);

  return {
    adminRoleId,
    viewerRoleId,
  };
}

export async function seedIntegrationTestData(prisma: PrismaService): Promise<TestTenantContext> {
  await resetDatabase(prisma);

  const adminRoleId = await ensureRoleWithPermissions(
    prisma,
    SYSTEM_ROLES.ADMIN,
    Object.values(PERMISSIONS),
  );
  const viewerRoleId = await ensureRoleWithPermissions(prisma, SYSTEM_ROLES.VIEWER, [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ORG_READ,
  ]);

  const orgA = await prisma.organization.create({
    data: { name: 'Org Alpha', slug: 'org-alpha' },
  });
  const orgB = await prisma.organization.create({
    data: { name: 'Org Beta', slug: 'org-beta' },
  });

  const adminUserId = await createUserWithRole(
    prisma,
    orgA.id,
    'admin@alpha.test',
    'Alpha Admin',
    adminRoleId,
  );
  const viewerUserId = await createUserWithRole(
    prisma,
    orgA.id,
    'viewer@alpha.test',
    'Alpha Viewer',
    viewerRoleId,
  );
  await createUserWithRole(prisma, orgB.id, 'admin@beta.test', 'Beta Admin', adminRoleId);

  return {
    organizationId: orgA.id,
    adminUserId,
    viewerUserId,
    otherOrganizationId: orgB.id,
  };
}

export async function login(
  app: INestApplication,
  email: string,
  password = TEST_PASSWORD,
  organizationSlug = 'org-alpha',
): Promise<LoginResponse> {
  const response = await apiRequest(app)
    .post(apiPath('/auth/login'))
    .send({ email, password, organizationSlug })
    .expect((res) => {
      if (res.status !== 200) {
        console.log('LOGIN ERROR BODY:', JSON.stringify(res.body, null, 2));
      }
      expect(res.status).toBe(200);
    });

  const body = response.body as LoginResponse;

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn,
  };
}
