import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listRoles() {
    return this.prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
  ) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        id: permissionId,
      },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

}
