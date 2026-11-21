import { BadRequestException } from '@nestjs/common';

import { UsageService } from './usage.service';

describe('UsageService', () => {
  const createPrisma = () => ({
    organizationMonthlyUsage: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  });

  describe('analyze', () => {
    it('returns warnings for metrics at or above 80%', () => {
      const prisma = createPrisma();
      const service = new UsageService(prisma as never);

      expect(
        service.analyze(
          {
            organizationId: 'org-1',
            users: 8,
            sites: 4,
            assets: 10,
            workOrdersThisMonth: 81,
          },
          {
            maxUsers: 10,
            maxSites: 5,
            maxAssets: 20,
            maxWorkOrdersPerMonth: 100,
          },
        ),
      ).toEqual([
        {
          metric: 'USERS',
          percentageUsed: 80,
          message: 'A utilização de USERS está em 80% da capacidade do plano.',
        },
        {
          metric: 'SITES',
          percentageUsed: 80,
          message: 'A utilização de SITES está em 80% da capacidade do plano.',
        },
        {
          metric: 'WORK_ORDERS',
          percentageUsed: 81,
          message: 'A utilização de WORK_ORDERS está em 81% da capacidade do plano.',
        },
      ]);
    });

    it('ignores unlimited metrics', () => {
      const prisma = createPrisma();
      const service = new UsageService(prisma as never);

      expect(
        service.analyze(
          {
            organizationId: 'org-1',
            users: 1000,
            sites: 1000,
            assets: 1000,
            workOrdersThisMonth: 1000,
          },
          {
            maxUsers: Infinity,
            maxSites: Infinity,
            maxAssets: Infinity,
            maxWorkOrdersPerMonth: Infinity,
          },
        ),
      ).toEqual([]);
    });
  });

  describe('reserveAiRequest', () => {
    it('creates the monthly usage row and reserves one request', async () => {
      const prisma = createPrisma();
      prisma.organizationMonthlyUsage.upsert.mockResolvedValue({
        id: 'usage-1',
      });
      prisma.organizationMonthlyUsage.updateMany.mockResolvedValue({
        count: 1,
      });

      const service = new UsageService(prisma as never);

      await expect(
        service.reserveAiRequest('org-1', 25),
      ).resolves.toBeUndefined();

      expect(
        prisma.organizationMonthlyUsage.upsert,
      ).toHaveBeenCalledWith({
        where: {
          organizationId_periodStart: expect.objectContaining({
            organizationId: 'org-1',
            periodStart: expect.any(Date) as unknown,
          }) as unknown,
        },
        create: {
          organizationId: 'org-1',
          periodStart: expect.any(Date) as unknown,
          aiRequests: 0,
        },
        update: {},
      });

      expect(
        prisma.organizationMonthlyUsage.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          periodStart: expect.any(Date) as unknown,
          aiRequests: {
            lt: 25,
          },
        },
        data: {
          aiRequests: {
            increment: 1,
          },
        },
      });
    });

    it('rejects when the atomic increment cannot reserve a request', async () => {
      const prisma = createPrisma();
      prisma.organizationMonthlyUsage.upsert.mockResolvedValue({
        id: 'usage-1',
      });
      prisma.organizationMonthlyUsage.updateMany.mockResolvedValue({
        count: 0,
      });

      const service = new UsageService(prisma as never);

      await expect(
        service.reserveAiRequest('org-1', 25),
      ).rejects.toThrow(
        new BadRequestException(
          'You have reached your aiRequestsPerMonth limit for the current plan.',
        ),
      );
    });

    it('allows only one concurrent reservation when one request remains', async () => {
      const prisma = createPrisma();

      prisma.organizationMonthlyUsage.upsert.mockResolvedValue({
        id: 'usage-1',
      });

      let reserved = false;

      prisma.organizationMonthlyUsage.updateMany.mockImplementation(
        () => {
          if (reserved) {
            return { count: 0 };
          }

          reserved = true;
          return { count: 1 };
        },
      );

      const service = new UsageService(prisma as never);

      const results = await Promise.allSettled([
        service.reserveAiRequest('org-1', 1),
        service.reserveAiRequest('org-1', 1),
      ]);

      expect(
        results.filter((result) => result.status === 'fulfilled'),
      ).toHaveLength(1);

      expect(
        results.filter((result) => result.status === 'rejected'),
      ).toHaveLength(1);

      const rejected = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      );

      expect(rejected?.reason).toEqual(
        new BadRequestException(
          'You have reached your aiRequestsPerMonth limit for the current plan.',
        ),
      );

      expect(
        prisma.organizationMonthlyUsage.updateMany,
      ).toHaveBeenCalledTimes(2);
    });

    it('does not persist usage for an unlimited plan', async () => {
      const prisma = createPrisma();
      const service = new UsageService(prisma as never);

      await expect(
        service.reserveAiRequest('org-1', Infinity),
      ).resolves.toBeUndefined();

      expect(
        prisma.organizationMonthlyUsage.upsert,
      ).not.toHaveBeenCalled();

      expect(
        prisma.organizationMonthlyUsage.updateMany,
      ).not.toHaveBeenCalled();
    });

    it('rejects a missing organization', async () => {
      const prisma = createPrisma();
      const service = new UsageService(prisma as never);

      await expect(
        service.reserveAiRequest('', 25),
      ).rejects.toThrow('Organization is required for AI usage.');
    });

    it('rejects an invalid limit', async () => {
      const prisma = createPrisma();
      const service = new UsageService(prisma as never);

      await expect(
        service.reserveAiRequest('org-1', -1),
      ).rejects.toThrow('Invalid AI request limit.');
    });
  });
});
