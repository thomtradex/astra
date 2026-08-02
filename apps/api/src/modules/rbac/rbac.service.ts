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
}
