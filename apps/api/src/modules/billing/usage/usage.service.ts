import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

import { UsageLimitExceededException } from './usage-limit-exceeded.exception';
import {
  OrganizationUsage,
  UsageWarning,
} from './usage.types';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  analyze(
    usage: OrganizationUsage,
    limits: {
      maxUsers: number;
      maxSites: number;
      maxAssets: number;
      maxWorkOrdersPerMonth: number;
    },
  ): UsageWarning[] {
    const warnings: UsageWarning[] = [];

    const checks = [
      {
        metric: 'USERS' as const,
        value: usage.users,
        limit: limits.maxUsers,
      },
      {
        metric: 'SITES' as const,
        value: usage.sites,
        limit: limits.maxSites,
      },
      {
        metric: 'ASSETS' as const,
        value: usage.assets,
        limit: limits.maxAssets,
      },
      {
        metric: 'WORK_ORDERS' as const,
        value: usage.workOrdersThisMonth,
        limit: limits.maxWorkOrdersPerMonth,
      },
    ];

    for (const check of checks) {
      if (check.limit === Infinity) {
        continue;
      }

      const percentage = Math.round((check.value / check.limit) * 100);

      if (percentage >= 80) {
        warnings.push({
          metric: check.metric,
          percentageUsed: percentage,
          message: `A utilização de ${check.metric} está em ${percentage}% da capacidade do plano.`,
        });
      }
    }

    return warnings;
  }

  async reserveAiRequest(
    organizationId: string,
    maximumRequests: number,
  ): Promise<void> {
    if (!organizationId) {
      throw new BadRequestException('Organization is required for AI usage.');
    }

    if (maximumRequests === Infinity) {
      return;
    }

    if (!Number.isFinite(maximumRequests) || maximumRequests < 0) {
      throw new BadRequestException('Invalid AI request limit.');
    }

    const periodStart = this.getCurrentPeriodStart();

    await this.prisma.organizationMonthlyUsage.upsert({
      where: {
        organizationId_periodStart: {
          organizationId,
          periodStart,
        },
      },
      create: {
        organizationId,
        periodStart,
        aiRequests: 0,
      },
      update: {},
    });

    const updated = await this.prisma.organizationMonthlyUsage.updateMany({
      where: {
        organizationId,
        periodStart,
        aiRequests: {
          lt: maximumRequests,
        },
      },
      data: {
        aiRequests: {
          increment: 1,
        },
      },
    });

    if (updated.count === 0) {
      throw new UsageLimitExceededException('aiRequestsPerMonth');
    }
  }

  private getCurrentPeriodStart(): Date {
    const now = new Date();

    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
  }
}
