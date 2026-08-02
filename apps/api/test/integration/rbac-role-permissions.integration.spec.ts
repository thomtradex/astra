import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('RBAC role permissions (integration)', () => {
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

  it('allows admin to assign permission to role', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const role = await prisma.role.findFirstOrThrow({
      where: {
        name: 'VIEWER',
      },
    });

    const permission = await prisma.permission.findFirstOrThrow({
      where: {
        name: 'user:write',
      },
    });

    await request(app.getHttpServer())
      .post(apiPath(`/rbac/roles/${role.id}/permissions/${permission.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    const relation = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
    });

    expect(relation).toBeDefined();
  });

  it('allows admin to remove permission from role', async () => {
    const { accessToken } = await login(app, 'admin@alpha.test');

    const role = await prisma.role.findFirstOrThrow({
      where: {
        name: 'VIEWER',
      },
    });

    const permission = await prisma.permission.findFirstOrThrow({
      where: {
        name: 'user:write',
      },
    });

    await prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });

    await request(app.getHttpServer())
      .delete(apiPath(`/rbac/roles/${role.id}/permissions/${permission.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const relation = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
    });

    expect(relation).toBeNull();
  });

  it('denies viewer from changing role permissions', async () => {
    const { accessToken } = await login(app, 'viewer@alpha.test');

    const role = await prisma.role.findFirstOrThrow({
      where: {
        name: 'VIEWER',
      },
    });

    const permission = await prisma.permission.findFirstOrThrow({
      where: {
        name: 'user:write',
      },
    });

    await request(app.getHttpServer())
      .post(apiPath(`/rbac/roles/${role.id}/permissions/${permission.id}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
