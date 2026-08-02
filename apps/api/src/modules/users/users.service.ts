import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginatedResult, normalizePagination, PaginatedResult } from '@astra/shared';
import { Prisma, User } from '@astra/database';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@astra/database';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[];
}

export interface ListUsersQuery {
  organizationId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listByOrganization(query: ListUsersQuery): Promise<PaginatedResult<UserListItem>> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const where = { organizationId: query.organizationId };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.roles.map((role) => role.role.name),
    }));

    return buildPaginatedResult(items, total, page, limit);
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<UserListItem> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.roles.map((role) => role.role.name),
    };
  }

  async create(
    dto: any,
    organizationId: string,
  ): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email.toLowerCase(),
          passwordHash: await bcrypt.hash(dto.password, 10),
          organizationId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User email already exists');
      }

      throw error;
    }
  }

  async update(
    id: string,
    organizationId: string,
    dto: any,
  ): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
        ...(dto.password && {
          passwordHash: await bcrypt.hash(dto.password, 10),
        }),
      },
    });
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }


  async listRoles(
    id: string,
    organizationId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles.map((item) => item.role);
  }

  async assignRole(
    id: string,
    organizationId: string,
    roleId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const relation = await this.prisma.userRole.create({
      data: {
        userId: id,
        roleId,
      },
    });

    await this.auditService.log({
      organizationId,
      actorId: id,
      action: AuditAction.ROLE_ASSIGN,
      resource: 'users',
      resourceId: id,
      metadata: {
        roleId,
      },
    });

    return relation;
  }

  async removeRole(
    id: string,
    organizationId: string,
    roleId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.roles.length <= 1) {
      throw new ConflictException('User must keep at least one role');
    }

    const relation = await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: id,
          roleId,
        },
      },
    });

    await this.auditService.log({
      organizationId,
      actorId: id,
      action: AuditAction.ROLE_REMOVE,
      resource: 'users',
      resourceId: id,
      metadata: {
        roleId,
      },
    });

    return relation;
  }

}