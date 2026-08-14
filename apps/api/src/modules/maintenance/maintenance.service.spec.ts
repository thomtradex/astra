import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { MaintenanceService } from './maintenance.service';

type MaintenancePlansDelegate = PrismaService['maintenance_plans'];
type AssetsDelegate = PrismaService['assets'];

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  const prisma = {
    maintenance_plans: {
      findMany: jest.fn() as jest.MockedFunction<MaintenancePlansDelegate['findMany']>,
      findFirst: jest.fn() as jest.MockedFunction<MaintenancePlansDelegate['findFirst']>,
      create: jest.fn() as jest.MockedFunction<MaintenancePlansDelegate['create']>,
    },
    assets: {
      findFirst: jest.fn() as jest.MockedFunction<AssetsDelegate['findFirst']>,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new MaintenanceService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('returns plans for the organization ordered by nextDue asc', async () => {
      const plans = [
        {
          id: 'plan-1',
          status: 'ACTIVE',
          organization_id: 'org-1',
          created_at: new Date(),
          updated_at: new Date(),
          plan: 'Inspection',
          assetId: 'asset-1',
          frequency: 'MONTHLY',
          nextDue: new Date('2026-01-01'),
        },
        {
          id: 'plan-2',
          status: 'ACTIVE',
          organization_id: 'org-1',
          created_at: new Date(),
          updated_at: new Date(),
          plan: 'Inspection',
          assetId: 'asset-2',
          frequency: 'MONTHLY',
          nextDue: new Date('2026-02-01'),
        },
      ];

      prisma.maintenance_plans.findMany.mockResolvedValue(plans);

      await expect(service.findAll('org-1')).resolves.toEqual(plans);

      expect(prisma.maintenance_plans.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1' },
        orderBy: { nextDue: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a plan belonging to the organization', async () => {
      const plan = {
        id: 'plan-1',
        status: 'ACTIVE',
        organization_id: 'org-1',
        created_at: new Date(),
        updated_at: new Date(),
        plan: 'Inspection',
        assetId: 'asset-1',
        frequency: 'MONTHLY',
        nextDue: new Date('2026-01-01'),
      };

      prisma.maintenance_plans.findFirst.mockResolvedValue(plan);

      await expect(service.findOne('plan-1', 'org-1')).resolves.toEqual(plan);

      expect(prisma.maintenance_plans.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'plan-1',
          organization_id: 'org-1',
        },
      });
    });

    it('throws NotFoundException when the plan does not exist', async () => {
      prisma.maintenance_plans.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('throws NotFoundException when the asset does not belong to the organization', async () => {
      prisma.assets.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            plan: 'Monthly inspection',
            assetId: 'asset-1',
            frequency: 'MONTHLY',
            nextDue: '2026-09-01T10:00:00.000Z',
          },
          'org-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.maintenance_plans.create).not.toHaveBeenCalled();

      expect(prisma.assets.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'asset-1',
          organization_id: 'org-1',
        },
      });
    });

    it('creates a maintenance plan when the asset belongs to the organization', async () => {
      prisma.assets.findFirst.mockResolvedValue({
        id: 'asset-1',
        name: 'Asset',
        code: 'AST-001',
        serial_number: null,
        description: null,
        status: 'ACTIVE',
        organization_id: 'org-1',
        site_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const created = {
        id: 'plan-1',
        status: 'ACTIVE',
        organization_id: 'org-1',
        created_at: new Date(),
        updated_at: new Date(),
        plan: 'Monthly inspection',
        assetId: 'asset-1',
        frequency: 'MONTHLY',
        nextDue: new Date('2026-09-01T10:00:00.000Z'),
      };

      prisma.maintenance_plans.create.mockResolvedValue(created);

      const result = await service.create(
        {
          plan: 'Monthly inspection',
          assetId: 'asset-1',
          frequency: 'MONTHLY',
          nextDue: '2026-09-01T10:00:00.000Z',
        },
        'org-1',
      );

      expect(result).toEqual(created);

      expect(prisma.maintenance_plans.create).toHaveBeenCalledTimes(1);

      const call = prisma.maintenance_plans.create.mock.calls[0];
      expect(call).toBeDefined();
      const createArgs = call![0];

      expect(createArgs.data).toMatchObject({
        plan: 'Monthly inspection',
        assetId: 'asset-1',
        frequency: 'MONTHLY',
        organization_id: 'org-1',
      });

      expect(createArgs.data.id).toEqual(expect.any(String));
      expect(createArgs.data.nextDue).toEqual(new Date('2026-09-01T10:00:00.000Z'));
      expect(createArgs.data.updated_at).toEqual(expect.any(Date));
    });
  });
});
