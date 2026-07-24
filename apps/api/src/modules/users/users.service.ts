import { Injectable } from '@nestjs/common';
import { buildPaginatedResult, normalizePagination, PaginatedResult } from '@astra/shared';

import { PrismaService } from '../../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

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
}