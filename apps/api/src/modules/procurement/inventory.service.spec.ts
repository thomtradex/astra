import { Prisma } from '@astra/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  const prisma = {
    inventory_stock: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    sites: {
      findFirst: jest.fn(),
    },
    materials: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn<
      Promise<unknown>,
      [(callback: (tx: unknown) => Promise<unknown>) => Promise<unknown>]
    >(),
  };


  beforeEach(() => {
    jest.clearAllMocks();
    service = new InventoryService(prisma as never);
  });

  describe('findAll', () => {
    it('returns stock scoped to the organization', async () => {
      const stock = [{ id: 'stock-1', organization_id: 'org-1' }];

      prisma.inventory_stock.findMany.mockResolvedValue(stock);

      await expect(service.findAll('org-1')).resolves.toEqual(stock);

      expect(prisma.inventory_stock.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org-1',
          site_id: undefined,
          material_id: undefined,
        },
        include: {
          materials: true,
          sites: true,
        },
        orderBy: [
          { site_id: 'asc' },
          { material_id: 'asc' },
        ],
      });
    });

    it('supports site and material filters', async () => {
      prisma.inventory_stock.findMany.mockResolvedValue([]);

      await service.findAll('org-1', 'site-1', 'material-1');

      expect(prisma.inventory_stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organization_id: 'org-1',
            site_id: 'site-1',
            material_id: 'material-1',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns stock scoped to the organization', async () => {
      const stock = {
        id: 'stock-1',
        organization_id: 'org-1',
      };

      prisma.inventory_stock.findFirst.mockResolvedValue(stock);

      await expect(service.findOne('stock-1', 'org-1')).resolves.toEqual(stock);
    });

    it('throws when stock belongs to another organization or does not exist', async () => {
      prisma.inventory_stock.findFirst.mockResolvedValue(null);

      await expect(service.findOne('stock-1', 'org-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findByMaterialAndSite', () => {
    it('scopes the lookup by organization, site and material', async () => {
      prisma.inventory_stock.findFirst.mockResolvedValue(null);

      await service.findByMaterialAndSite('material-1', 'site-1', 'org-1');

      expect(prisma.inventory_stock.findFirst).toHaveBeenCalledWith({
        where: {
          organization_id: 'org-1',
          material_id: 'material-1',
          site_id: 'site-1',
        },
      });
    });
  });

  describe('createMovement', () => {
    const dto = {
      siteId: 'site-1',
      materialId: 'material-1',
      movementType: 'ADJUSTMENT_IN' as const,
      quantity: 10,
      reason: 'Initial stock',
    };

    const tx = {
      inventory_stock: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      inventory_movements: {
        create: jest.fn(),
      },
    };

    const transactionCallback = async (
      callback: (transaction: typeof tx) => Promise<unknown>,
    ): Promise<unknown> => callback(tx);



    beforeEach(() => {
      prisma.sites.findFirst.mockResolvedValue({ id: 'site-1' });
      prisma.materials.findFirst.mockResolvedValue({ id: 'material-1' });
      prisma.$transaction.mockImplementation(
        (callback) => transactionCallback(callback as never),
      );

      tx.inventory_stock.findFirst.mockResolvedValue(null);
      tx.inventory_stock.create.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(10),
      });
      tx.inventory_movements.create.mockResolvedValue({
        id: 'movement-1',
        organization_id: 'org-1',
        movement_type: 'ADJUSTMENT_IN',
        quantity: new Prisma.Decimal(10),
      });
    });

    it('creates stock and movement atomically for an inbound movement', async () => {
      const result = await service.createMovement(dto, 'org-1');

      expect(result).toEqual({
        id: 'movement-1',
        organization_id: 'org-1',
        movement_type: 'ADJUSTMENT_IN',
        quantity: new Prisma.Decimal(10),
      });

      expect(tx.inventory_stock.create).toHaveBeenCalledTimes(1);

      const stockCreateCalls = tx.inventory_stock.create.mock.calls;
      const stockCreateCall = stockCreateCalls[0] as [
        {
          data: {
            organization_id: string;
            site_id: string;
            material_id: string;
            quantity_on_hand: Prisma.Decimal;
            quantity_reserved: number;
            id: string;
            updated_at: Date;
          };
        },
      ];

      expect(stockCreateCall[0].data.organization_id).toBe('org-1');
      expect(stockCreateCall[0].data.site_id).toBe('site-1');
      expect(stockCreateCall[0].data.material_id).toBe('material-1');
      expect(stockCreateCall[0].data.quantity_on_hand).toEqual(
        new Prisma.Decimal(10),
      );
      expect(stockCreateCall[0].data.quantity_reserved).toBe(0);
      expect(stockCreateCall[0].data.id).toEqual(expect.any(String));
      expect(stockCreateCall[0].data.updated_at).toEqual(expect.any(Date));

      expect(tx.inventory_movements.create).toHaveBeenCalledTimes(1);

      const movementCreateCalls = tx.inventory_movements.create.mock.calls;
      const movementCreateCall = movementCreateCalls[0] as [
        {
          data: {
            organization_id: string;
            site_id: string;
            material_id: string;
            movement_type: string;
            quantity: number;
            reason: string;
            id: string;
            occurred_at: Date;
            created_at: Date;
          };
        },
      ];

      expect(movementCreateCall[0].data.organization_id).toBe('org-1');
      expect(movementCreateCall[0].data.site_id).toBe('site-1');
      expect(movementCreateCall[0].data.material_id).toBe('material-1');
      expect(movementCreateCall[0].data.movement_type).toBe('ADJUSTMENT_IN');
      expect(movementCreateCall[0].data.quantity).toBe(10);
      expect(movementCreateCall[0].data.reason).toBe('Initial stock');
      expect(movementCreateCall[0].data.id).toEqual(expect.any(String));
      expect(movementCreateCall[0].data.occurred_at).toEqual(expect.any(Date));
      expect(movementCreateCall[0].data.created_at).toEqual(expect.any(Date));
    });

    it('increases existing stock for RECEIPT', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(20),
        quantity_reserved: new Prisma.Decimal(0),
      });

      await service.createMovement(
        {
          ...dto,
          movementType: 'RECEIPT',
          quantity: 5,
        },
        'org-1',
      );

      expect(tx.inventory_stock.update).toHaveBeenCalledTimes(1);

      const stockUpdateCalls = tx.inventory_stock.update.mock.calls;
      const stockUpdateCall = stockUpdateCalls[0] as [
        {
          where: {
            id: string;
          };
          data: {
            quantity_on_hand: Prisma.Decimal;
          };
        },
      ];

      expect(stockUpdateCall[0].where.id).toBe('stock-1');
      expect(stockUpdateCall[0].data.quantity_on_hand).toEqual(
        new Prisma.Decimal(25),
      );
    });

    it('decreases existing stock for ADJUSTMENT_OUT', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(20),
        quantity_reserved: new Prisma.Decimal(0),
      });

      await service.createMovement(
        {
          ...dto,
          movementType: 'ADJUSTMENT_OUT',
          quantity: 5,
        },
        'org-1',
      );

      expect(tx.inventory_stock.update).toHaveBeenCalledTimes(1);

      const stockUpdateCalls = tx.inventory_stock.update.mock.calls;
      const stockUpdateCall = stockUpdateCalls[0] as [
        {
          where: {
            id: string;
          };
          data: {
            quantity_on_hand: Prisma.Decimal;
          };
        },
      ];

      expect(stockUpdateCall[0].where.id).toBe('stock-1');
      expect(stockUpdateCall[0].data.quantity_on_hand).toEqual(
        new Prisma.Decimal(15),
      );
    });

    it('rejects an outbound movement that would make stock negative', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(3),
        quantity_reserved: new Prisma.Decimal(0),
      });

      await expect(
        service.createMovement(
          {
            ...dto,
            movementType: 'ADJUSTMENT_OUT',
            quantity: 5,
          },
          'org-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
    });

    it('rejects an outbound movement that would consume reserved stock', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(10),
        quantity_reserved: new Prisma.Decimal(7),
      });

      await expect(
        service.createMovement(
          {
            ...dto,
            movementType: 'ADJUSTMENT_OUT',
            quantity: 5,
          },
          'org-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
    });

    it('rejects a site from another organization', async () => {
      prisma.sites.findFirst.mockResolvedValue(null);

      await expect(
        service.createMovement(dto, 'org-1'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a material from another organization', async () => {
      prisma.sites.findFirst.mockResolvedValue({ id: 'site-1' });
      prisma.materials.findFirst.mockResolvedValue(null);

      await expect(
        service.createMovement(dto, 'org-1'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('keeps stock and movement inside the same transaction', async () => {
      await service.createMovement(dto, 'org-1');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.inventory_stock.create).toHaveBeenCalledTimes(1);
      expect(tx.inventory_movements.create).toHaveBeenCalledTimes(1);
    });
  });
});
