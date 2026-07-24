import { PERMISSIONS, ROLE_PERMISSIONS, SYSTEM_ROLES } from '@astra/shared';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_ORG = {
  name: 'Astra Demo Organization',
  slug: 'astra-demo',
};

const DEFAULT_ADMIN = {
  email: 'admin@astra.local',
  password: 'AstraDev2026!',
  firstName: 'System',
  lastName: 'Administrator',
};

async function seedPermissions(): Promise<Map<string, string>> {
  const permissionMap = new Map<string, string>();

  for (const permission of Object.values(PERMISSIONS)) {
    const record = await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: {
        name: permission,
        description: `Permission: ${permission}`,
      },
    });
    permissionMap.set(permission, record.id);
  }

  return permissionMap;
}

async function seedRoles(permissionMap: Map<string, string>): Promise<Map<string, string>> {
  const roleMap = new Map<string, string>();

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `System role: ${roleName}`,
        isSystem: true,
      },
    });

    roleMap.set(roleName, role.id);

    for (const permission of permissions) {
      const permissionId = permissionMap.get(permission);
      if (!permissionId) continue;

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
  }

  return roleMap;
}

async function seedOrganizationAndAdmin(roleMap: Map<string, string>): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { slug: DEFAULT_ORG.slug },
    update: {},
    create: DEFAULT_ORG,
  });

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
  const superAdminRoleId = roleMap.get(SYSTEM_ROLES.SUPER_ADMIN);

  if (!superAdminRoleId) {
    throw new Error('SUPER_ADMIN role not found during seed');
  }

  const admin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: DEFAULT_ADMIN.email,
      },
    },
    update: {},
    create: {
      email: DEFAULT_ADMIN.email,
      passwordHash,
      firstName: DEFAULT_ADMIN.firstName,
      lastName: DEFAULT_ADMIN.lastName,
      organizationId: organization.id,
      roles: {
        create: {
          roleId: superAdminRoleId,
        },
      },
    },
  });

  console.info('Seed complete:');
  console.info(`  Organization: ${organization.name} (${organization.slug})`);
  console.info(`  Admin user:   ${admin.email}`);
  console.info(`  Password:     ${DEFAULT_ADMIN.password} (change immediately in production)`);
}

async function main(): Promise<void> {
  console.info('Seeding Astra database...');

  const permissionMap = await seedPermissions();
  const roleMap = await seedRoles(permissionMap);
  await seedOrganizationAndAdmin(roleMap);

  console.info('Database seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
