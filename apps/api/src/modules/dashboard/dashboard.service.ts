import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      users,
      organizations,
      roles,
      auditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.role.count(),
      this.prisma.auditLog.count(),
    ]);

    return {
      users,
      organizations,
      roles,
      auditLogs,
      database: 'up',
    };
  }
}