import { Prisma } from '@astra/database';

import { PrismaService } from '../../prisma/prisma.service';

import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersService', () => {
  const prisma = {
    work_orders: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      delete: jest.fn(),
    },
    work_order_materials: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    inventory_stock: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventory_movements: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    projects: {
      findFirst: jest.fn(),
    },
    assets: {
      findFirst: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  };

  let service: WorkOrdersService;

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      async (
        callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
      ) => callback(prisma as unknown as Prisma.TransactionClient),
    );
    service = new WorkOrdersService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates a work order with a responsible user from the same organization', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.work_orders.count.mockResolvedValue(0);
      prisma.work_orders.create.mockResolvedValue({
        id: 'wo-1',
        title: 'Inspeção',
        assigned_to_id: 'user-1',
      });

      const result = await service.create('org-1', {
        title: 'Inspeção',
        priority: 'HIGH',
        assignedToId: 'user-1',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          organizationId: 'org-1',
        },
        select: {
          id: true,
        },
      });

      expect(prisma.work_orders.create).toHaveBeenCalled();

      expect(result).toEqual({
        id: 'wo-1',
        title: 'Inspeção',
        assigned_to_id: 'user-1',
      });
    });

    it('rejects a responsible user from another organization', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.create('org-1', {
          title: 'Inspeção',
          priority: 'HIGH',
          assignedToId: 'user-other-org',
        }),
      ).rejects.toThrow('User not found for this organization');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-other-org',
          organizationId: 'org-1',
        },
        select: {
          id: true,
        },
      });

      expect(prisma.work_orders.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates a work order within the organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.work_orders.update.mockResolvedValue({
        id: 'wo-1',
        status: 'IN_PROGRESS',
      });

      await expect(
        service.update('wo-1', 'org-1', {
          status: 'IN_PROGRESS',
        }),
      ).resolves.toEqual({
        id: 'wo-1',
        status: 'IN_PROGRESS',
      });

      expect(prisma.work_orders.update).toHaveBeenCalledWith({
        where: {
          id: 'wo-1',
        },
        data: expect.objectContaining({
          status: 'IN_PROGRESS',
          updated_at: expect.any(Date) as unknown,
        }) as unknown,
      });
    });

    it('rejects a work order from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue(null);

      await expect(
        service.update('wo-other', 'org-1', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow('Work order not found');

      expect(prisma.work_orders.update).not.toHaveBeenCalled();
    });

    it('rejects assigning a project from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.projects.findFirst.mockResolvedValue(null);

      await expect(
        service.update('wo-1', 'org-1', {
          projectId: 'project-other',
        }),
      ).rejects.toThrow('Project not found for this organization');

      expect(prisma.work_orders.update).not.toHaveBeenCalled();

      expect(prisma.projects.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'project-other',
          organization_id: 'org-1',
        },
        select: {
          id: true,
        },
      });
    });

    it('rejects assigning an asset from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.assets.findFirst.mockResolvedValue(null);

      await expect(
        service.update('wo-1', 'org-1', {
          assetId: 'asset-other',
        }),
      ).rejects.toThrow('Asset not found for this organization');

      expect(prisma.work_orders.update).not.toHaveBeenCalled();

      expect(prisma.assets.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'asset-other',
          organization_id: 'org-1',
        },
        select: {
          id: true,
        },
      });
    });

    it('updates a work order with a project from the same organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.projects.findFirst.mockResolvedValue({
        id: 'project-1',
      });

      prisma.work_orders.update.mockResolvedValue({
        id: 'wo-1',
        project_id: 'project-1',
      });

      await expect(
        service.update('wo-1', 'org-1', {
          projectId: 'project-1',
        }),
      ).resolves.toEqual({
        id: 'wo-1',
        project_id: 'project-1',
      });

      expect(prisma.work_orders.update).toHaveBeenCalledWith({
        where: {
          id: 'wo-1',
        },
        data: expect.objectContaining({
          project_id: 'project-1',
        }) as unknown,
      });
    });

    it('updates a work order with an asset from the same organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.assets.findFirst.mockResolvedValue({
        id: 'asset-1',
      });

      prisma.work_orders.update.mockResolvedValue({
        id: 'wo-1',
        asset_id: 'asset-1',
      });

      await expect(
        service.update('wo-1', 'org-1', {
          assetId: 'asset-1',
        }),
      ).resolves.toEqual({
        id: 'wo-1',
        asset_id: 'asset-1',
      });

      expect(prisma.work_orders.update).toHaveBeenCalledWith({
        where: {
          id: 'wo-1',
        },
        data: expect.objectContaining({
          asset_id: 'asset-1',
        }) as unknown,
      });
    });

    it('updates a work order with a user from the same organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
      });

      prisma.work_orders.update.mockResolvedValue({
        id: 'wo-1',
        assigned_to_id: 'user-1',
      });

      await expect(
        service.update('wo-1', 'org-1', {
          assignedToId: 'user-1',
        }),
      ).resolves.toEqual({
        id: 'wo-1',
        assigned_to_id: 'user-1',
      });

      expect(prisma.work_orders.update).toHaveBeenCalledWith({
        where: {
          id: 'wo-1',
        },
        data: expect.objectContaining({
          assigned_to_id: 'user-1',
        }) as unknown,
      });
    });

    it('rejects assigning a user from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({
        id: 'wo-1',
      });

      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update('wo-1', 'org-1', {
          assignedToId: 'user-other',
        }),
      ).rejects.toThrow('User not found for this organization');

      expect(prisma.work_orders.update).not.toHaveBeenCalled();

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-other',
          organizationId: 'org-1',
        },
        select: {
          id: true,
        },
      });
    });
  });

  describe('reservation release on terminal work orders', () => {
    const setupReservation = (stockReserved = 3) => {
      prisma.work_order_materials.findMany.mockResolvedValue([
        {
          id: 'wom-1',
          site_id: 'site-1',
          material_id: 'material-1',
          required_quantity: new Prisma.Decimal(10),
          reserved_quantity: new Prisma.Decimal(3),
          consumed_quantity: new Prisma.Decimal(2),
        },
      ]);

      prisma.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_reserved: new Prisma.Decimal(stockReserved),
      });
    };

    it.each(['CANCELLED', 'COMPLETED', 'CLOSED'])(
      'releases reservations and records movement when status becomes %s',
      async (status) => {
        prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
        setupReservation(8);
        prisma.work_orders.update.mockResolvedValue({
          id: 'wo-1',
          status,
        });

        await expect(
          service.update('wo-1', 'org-1', { status }),
        ).resolves.toEqual({ id: 'wo-1', status });

        expect(prisma.inventory_stock.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'stock-1' },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({
              quantity_reserved: new Prisma.Decimal(5),
            }),
          }),
        );

        expect(prisma.work_order_materials.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'wom-1' },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({
              reserved_quantity: new Prisma.Decimal(0),
              status: 'REQUIRED',
            }),
          }),
        );

        expect(prisma.inventory_movements.create).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({
              organization_id: 'org-1',
              movement_type: 'RESERVATION_RELEASE',
              quantity: new Prisma.Decimal(3),
              reference_id: 'wom-1',
            }),
          }),
        );
      },
    );

    it('releases reservations before deleting the work order', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
      setupReservation(8);
      prisma.work_orders.delete.mockResolvedValue({ id: 'wo-1' });

      await expect(
        service.remove('wo-1', 'org-1'),
      ).resolves.toEqual({ id: 'wo-1' });

      expect(prisma.inventory_stock.update).toHaveBeenCalledTimes(1);
      expect(prisma.inventory_movements.create).toHaveBeenCalledTimes(1);
      expect(prisma.work_orders.delete).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
      });
    });

    it('rejects an inconsistent inventory reservation without updating or deleting the order', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
      setupReservation(2);

      await expect(
        service.update('wo-1', 'org-1', { status: 'CANCELLED' }),
      ).rejects.toThrow('inventory reservation is inconsistent');

      expect(prisma.inventory_stock.update).not.toHaveBeenCalled();
      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
      expect(prisma.inventory_movements.create).not.toHaveBeenCalled();
      expect(prisma.work_orders.update).not.toHaveBeenCalled();
    });
  });

});
