import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@astra/database';

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
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

    const relation = await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    await this.auditService.log({
      organizationId: 'system',
      action: AuditAction.PERMISSION_ASSIGN,
      resource: 'rbac',
      resourceId: roleId,
      metadata: {
        permissionId,
      },
    });

    return relation;
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ) {
    const relation = await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    await this.auditService.log({
      organizationId: 'system',
      action: AuditAction.PERMISSION_REMOVE,
      resource: 'rbac',
      resourceId: roleId,
      metadata: {
        permissionId,
      },
    });

    return relation;
  }

}
