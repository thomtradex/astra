import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string) {
    const [
      users,
      sites,
      assets,
      auditLogs,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { organizationId },
      }),
      this.prisma.site.count({
        where: { organizationId },
      }),
      this.prisma.asset.count({
        where: { organizationId },
      }),
      this.prisma.auditLog.count({
        where: { organizationId },
      }),
    ]);

    return {
      users,
      sites,
      assets,
      auditLogs,
      database: 'up',
    };
  }
}
