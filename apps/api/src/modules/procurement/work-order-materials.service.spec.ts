import { Prisma } from '@astra/database';

import { PrismaService } from '../../prisma/prisma.service';

import { WorkOrderMaterialsService } from './work-order-materials.service';

describe('WorkOrderMaterialsService', () => {
  const prisma = {
    work_orders: {
      findFirst: jest.fn(),
    },
    materials: {
      findFirst: jest.fn(),
    },
    sites: {
      findFirst: jest.fn(),
    },
    work_order_materials: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inventory_stock: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventory_movements: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: WorkOrderMaterialsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new WorkOrderMaterialsService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates a required material for a work order in the same organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.materials.findFirst.mockResolvedValue({ id: 'material-1' });
      prisma.sites.findFirst.mockResolvedValue({ id: 'site-1' });
      prisma.work_order_materials.findFirst.mockResolvedValue(null);
      prisma.work_order_materials.create.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: 10,
        reserved_quantity: 0,
        consumed_quantity: 0,
        status: 'REQUIRED',
        notes: 'Filtro',
      });

      await expect(
        service.create(
          {
            workOrderId: 'wo-1',
            materialId: 'material-1',
            siteId: 'site-1',
            requiredQuantity: 10,
            notes: 'Filtro',
          },
          'org-1',
        ),
      ).resolves.toEqual(
        expect.objectContaining({
          id: 'wom-1',
          organization_id: 'org-1',
          work_order_id: 'wo-1',
          material_id: 'material-1',
          required_quantity: 10,
          reserved_quantity: 0,
          consumed_quantity: 0,
          status: 'REQUIRED',
        }) as unknown,
      );

      expect(prisma.work_order_materials.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-1',
            work_order_id: 'wo-1',
            material_id: 'material-1',
            required_quantity: 10,
            reserved_quantity: 0,
            consumed_quantity: 0,
            status: 'REQUIRED',
          }) as unknown,
        }) as unknown,
      );
    });

    it('rejects a work order from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            workOrderId: 'wo-other',
            materialId: 'material-1',
            siteId: 'site-1',
            requiredQuantity: 10,
          },
          'org-1',
        ),
      ).rejects.toThrow('Work order not found for this organization');

      expect(prisma.materials.findFirst).not.toHaveBeenCalled();
      expect(prisma.work_order_materials.create).not.toHaveBeenCalled();
    });

    it('rejects a material from another organization', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.materials.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            workOrderId: 'wo-1',
            materialId: 'material-other',
            siteId: 'site-1',
            requiredQuantity: 10,
          },
          'org-1',
        ),
      ).rejects.toThrow('Material not found for this organization');

      expect(prisma.work_order_materials.create).not.toHaveBeenCalled();
    });

    it('rejects duplicate material requirements for the same work order', async () => {
      prisma.work_orders.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.materials.findFirst.mockResolvedValue({ id: 'material-1' });
      prisma.sites.findFirst.mockResolvedValue({ id: 'site-1' });
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'existing-1',
      });

      await expect(
        service.create(
          {
            workOrderId: 'wo-1',
            materialId: 'material-1',
            siteId: 'site-1',
            requiredQuantity: 10,
          },
          'org-1',
        ),
      ).rejects.toThrow('Material is already associated with this work order');

      expect(prisma.work_order_materials.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns only materials for the work order and organization', async () => {
      prisma.work_order_materials.findMany.mockResolvedValue([
        {
          id: 'wom-1',
          organization_id: 'org-1',
          work_order_id: 'wo-1',
          material_id: 'material-1',
        },
      ]);

      await expect(service.findAll('wo-1', 'org-1')).resolves.toEqual([
        {
          id: 'wom-1',
          organization_id: 'org-1',
          work_order_id: 'wo-1',
          material_id: 'material-1',
        },
      ]);

      expect(prisma.work_order_materials.findMany).toHaveBeenCalledWith({
        where: {
          work_order_id: 'wo-1',
          organization_id: 'org-1',
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('returns a work order material from the organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
      });

      await expect(service.findOne('wom-1', 'org-1')).resolves.toEqual({
        id: 'wom-1',
        organization_id: 'org-1',
      });

      expect(prisma.work_order_materials.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'wom-1',
          organization_id: 'org-1',
        },
      });
    });

    it('rejects a work order material from another organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue(null);

      await expect(service.findOne('wom-other', 'org-1')).rejects.toThrow(
        'Work order material not found',
      );
    });
  });

  describe('update', () => {
    it('updates the required quantity and notes', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'REQUIRED',
      });

      prisma.work_order_materials.update.mockResolvedValue({
        id: 'wom-1',
        required_quantity: 20,
        notes: 'Updated',
      });

      await expect(
        service.update(
          'wom-1',
          {
            requiredQuantity: 20,
            notes: 'Updated',
          },
          'org-1',
        ),
      ).resolves.toEqual({
        id: 'wom-1',
        required_quantity: 20,
        notes: 'Updated',
      });

      const updateCalls = prisma.work_order_materials.update.mock.calls as Array<
        [Prisma.work_order_materialsUpdateArgs]
      >;

      const updateCall = updateCalls[0]?.[0];

      expect(updateCall).toBeDefined();
      expect(updateCall?.where).toEqual({
        id: 'wom-1',
      });
      expect(updateCall?.data).toEqual(
        expect.objectContaining({
          required_quantity: 20,
          notes: 'Updated',
        }),
      );

      const updateData = updateCall?.data;

      if (updateData && !Array.isArray(updateData)) {
        expect(updateData.updated_at).toBeInstanceOf(Date);
      }
    });

    it('rejects updating a work order material from another organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          'wom-other',
          {
            requiredQuantity: 20,
          },
          'org-1',
        ),
      ).rejects.toThrow('Work order material not found');

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects moving the requirement to a work order from another organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'REQUIRED',
      });

      prisma.work_orders.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          'wom-1',
          {
            workOrderId: 'wo-other',
          },
          'org-1',
        ),
      ).rejects.toThrow('Work order not found for this organization');

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects moving the requirement to a material from another organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'REQUIRED',
      });

      prisma.materials.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          'wom-1',
          {
            materialId: 'material-other',
          },
          'org-1',
        ),
      ).rejects.toThrow('Material not found for this organization');

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects changing the site after inventory has been reserved', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(5),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'RESERVED',
      });

      await expect(service.update('wom-1', { siteId: 'site-2' }, 'org-1')).rejects.toThrow(
        'Cannot change work order, material, or site after inventory has been reserved or consumed',
      );

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects changing the work order after inventory has been consumed', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(5),
        status: 'RESERVED',
      });

      await expect(service.update('wom-1', { workOrderId: 'wo-2' }, 'org-1')).rejects.toThrow(
        'Cannot change work order, material, or site after inventory has been reserved or consumed',
      );

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects reducing required quantity below reserved and consumed quantity', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(4),
        consumed_quantity: new Prisma.Decimal(3),
        status: 'RESERVED',
      });

      await expect(service.update('wom-1', { requiredQuantity: 6 }, 'org-1')).rejects.toThrow(
        'Required quantity cannot be less than reserved and consumed quantity',
      );

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('allows increasing required quantity after reservation', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        work_order_id: 'wo-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(4),
        consumed_quantity: new Prisma.Decimal(3),
        status: 'RESERVED',
      });

      prisma.work_order_materials.update.mockResolvedValue({
        id: 'wom-1',
        required_quantity: 12,
        reserved_quantity: new Prisma.Decimal(4),
        consumed_quantity: new Prisma.Decimal(3),
        status: 'RESERVED',
      });

      await expect(service.update('wom-1', { requiredQuantity: 12 }, 'org-1')).resolves.toEqual({
        id: 'wom-1',
        required_quantity: 12,
        reserved_quantity: new Prisma.Decimal(4),
        consumed_quantity: new Prisma.Decimal(3),
        status: 'RESERVED',
      });

      expect(prisma.work_order_materials.update).toHaveBeenCalled();
    });

    it('rejects creating a duplicate relationship during update', async () => {
      prisma.work_order_materials.findFirst
        .mockResolvedValueOnce({
          id: 'wom-1',
          organization_id: 'org-1',
          work_order_id: 'wo-1',
          material_id: 'material-1',
          site_id: 'site-1',
          required_quantity: new Prisma.Decimal(10),
          reserved_quantity: new Prisma.Decimal(0),
          consumed_quantity: new Prisma.Decimal(0),
          status: 'REQUIRED',
        })
        .mockResolvedValueOnce({
          id: 'wom-2',
        });

      prisma.materials.findFirst.mockResolvedValue({
        id: 'material-2',
      });

      await expect(
        service.update(
          'wom-1',
          {
            materialId: 'material-2',
          },
          'org-1',
        ),
      ).rejects.toThrow('Material is already associated with this work order');

      expect(prisma.work_order_materials.update).not.toHaveBeenCalled();
    });
  });

  describe('reserve', () => {
    const tx = {
      work_order_materials: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      inventory_stock: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      inventory_movements: {
        create: jest.fn(),
      },
    };

    beforeEach(() => {
      const transactionMock = prisma.$transaction as jest.Mock<
        Promise<unknown>,
        [(transaction: typeof tx) => Promise<unknown>]
      >;

      transactionMock.mockImplementation(
        async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
      );

      tx.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'REQUIRED',
      });

      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(20),
        quantity_reserved: new Prisma.Decimal(0),
      });

      tx.inventory_stock.update.mockResolvedValue({});
      tx.work_order_materials.update.mockResolvedValue({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(10),
        status: 'RESERVED',
      });
    });

    it('rejects reservation above remaining quantity after consumption', async () => {
      tx.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(2),
        consumed_quantity: new Prisma.Decimal(7),
        status: 'RESERVED',
      });

      await expect(
        service.reserve(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 2,
          },
          'org-1',
        ),
      ).rejects.toThrow('Cannot reserve more material than required');

      expect(tx.inventory_stock.findFirst).not.toHaveBeenCalled();
    });

    it('reserves available inventory atomically', async () => {
      await expect(
        service.reserve(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 10,
          },
          'org-1',
        ),
      ).resolves.toEqual({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(10),
        status: 'RESERVED',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.inventory_stock.update).toHaveBeenCalledTimes(1);
      expect(tx.work_order_materials.update).toHaveBeenCalledTimes(1);

      expect(tx.inventory_stock.update).toHaveBeenCalledTimes(1);
      expect(tx.work_order_materials.update).toHaveBeenCalledTimes(1);
    });

    it('rejects reservation above available stock', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(5),
        quantity_reserved: new Prisma.Decimal(2),
      });

      await expect(
        service.reserve(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 4,
          },
          'org-1',
        ),
      ).rejects.toThrow('Insufficient available inventory');

      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects reservation above the required quantity', async () => {
      await expect(
        service.reserve(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 11,
          },
          'org-1',
        ),
      ).rejects.toThrow('Cannot reserve more material than required');

      expect(tx.inventory_stock.findFirst).not.toHaveBeenCalled();
      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
    });

    it('rejects a work order material from another organization', async () => {
      tx.work_order_materials.findFirst.mockResolvedValue(null);

      await expect(
        service.reserve(
          {
            workOrderMaterialId: 'wom-other',
            quantity: 1,
          },
          'org-1',
        ),
      ).rejects.toThrow('Work order material not found');

      expect(tx.inventory_stock.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('consume', () => {
    const tx = {
      work_order_materials: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      inventory_stock: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      inventory_movements: {
        create: jest.fn(),
      },
    };

    beforeEach(() => {
      const transactionMock = prisma.$transaction as jest.Mock<
        Promise<unknown>,
        [(transaction: typeof tx) => Promise<unknown>]
      >;

      transactionMock.mockImplementation(
        async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
      );

      tx.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(10),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'RESERVED',
      });

      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(20),
        quantity_reserved: new Prisma.Decimal(10),
      });

      tx.inventory_stock.update.mockResolvedValue({});

      tx.inventory_movements.create.mockResolvedValue({
        id: 'movement-1',
      });

      tx.work_order_materials.update.mockResolvedValue({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(5),
        consumed_quantity: new Prisma.Decimal(5),
        status: 'RESERVED',
      });
    });

    it('consumes reserved inventory atomically', async () => {
      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 5,
          },
          'org-1',
        ),
      ).resolves.toEqual({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(5),
        consumed_quantity: new Prisma.Decimal(5),
        status: 'RESERVED',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      expect(tx.inventory_stock.update).toHaveBeenCalledWith({
        where: {
          id: 'stock-1',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          quantity_on_hand: new Prisma.Decimal(15),
          quantity_reserved: new Prisma.Decimal(5),
        }),
      });

      expect(tx.inventory_movements.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          organization_id: 'org-1',
          site_id: 'site-1',
          material_id: 'material-1',
          movement_type: 'CONSUMPTION',
          quantity: new Prisma.Decimal(5),
          reference_type: 'WORK_ORDER_MATERIAL',
          reference_id: 'wom-1',
        }),
      });

      expect(tx.work_order_materials.update).toHaveBeenCalledWith({
        where: {
          id: 'wom-1',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          reserved_quantity: new Prisma.Decimal(5),
          consumed_quantity: new Prisma.Decimal(5),
          status: 'RESERVED',
        }),
      });
    });

    it('marks the material as consumed when the full required quantity is consumed', async () => {
      tx.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(10),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'RESERVED',
      });

      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(10),
        quantity_reserved: new Prisma.Decimal(10),
      });

      tx.work_order_materials.update.mockResolvedValue({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(10),
        status: 'CONSUMED',
      });

      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 10,
          },
          'org-1',
        ),
      ).resolves.toEqual({
        id: 'wom-1',
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(10),
        status: 'CONSUMED',
      });

      expect(tx.inventory_stock.update).toHaveBeenCalledWith({
        where: {
          id: 'stock-1',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          quantity_on_hand: new Prisma.Decimal(0),
          quantity_reserved: new Prisma.Decimal(0),
        }),
      });

      expect(tx.work_order_materials.update).toHaveBeenCalledWith({
        where: {
          id: 'wom-1',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          reserved_quantity: new Prisma.Decimal(0),
          consumed_quantity: new Prisma.Decimal(10),
          status: 'CONSUMED',
        }),
      });
    });

    it('rejects consuming more than reserved on the work order material', async () => {
      tx.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        material_id: 'material-1',
        site_id: 'site-1',
        required_quantity: new Prisma.Decimal(10),
        reserved_quantity: new Prisma.Decimal(3),
        consumed_quantity: new Prisma.Decimal(0),
        status: 'RESERVED',
      });

      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 4,
          },
          'org-1',
        ),
      ).rejects.toThrow('Cannot consume more material than reserved');

      expect(tx.inventory_stock.findFirst).not.toHaveBeenCalled();
      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
      expect(tx.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects consuming more than reserved in inventory', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(20),
        quantity_reserved: new Prisma.Decimal(3),
      });

      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 4,
          },
          'org-1',
        ),
      ).rejects.toThrow('Cannot consume more material than reserved in inventory');

      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
      expect(tx.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects insufficient on-hand stock', async () => {
      tx.inventory_stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity_on_hand: new Prisma.Decimal(3),
        quantity_reserved: new Prisma.Decimal(5),
      });

      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 4,
          },
          'org-1',
        ),
      ).rejects.toThrow('Insufficient inventory stock');

      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
      expect(tx.work_order_materials.update).not.toHaveBeenCalled();
    });

    it('rejects a work order material from another organization', async () => {
      tx.work_order_materials.findFirst.mockResolvedValue(null);

      await expect(
        service.consume(
          {
            workOrderMaterialId: 'wom-1',
            quantity: 5,
          },
          'org-1',
        ),
      ).rejects.toThrow('Work order material not found');

      expect(tx.inventory_stock.findFirst).not.toHaveBeenCalled();
      expect(tx.inventory_stock.update).not.toHaveBeenCalled();
      expect(tx.inventory_movements.create).not.toHaveBeenCalled();
      expect(tx.work_order_materials.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes a work order material from the organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
      });

      prisma.work_order_materials.delete.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
      });

      await expect(service.remove('wom-1', 'org-1')).resolves.toEqual({
        id: 'wom-1',
        organization_id: 'org-1',
      });

      expect(prisma.work_order_materials.delete).toHaveBeenCalledWith({
        where: {
          id: 'wom-1',
        },
      });
    });

    it('rejects removing a work order material after inventory has been reserved', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        reserved_quantity: new Prisma.Decimal(5),
        consumed_quantity: new Prisma.Decimal(0),
      });

      await expect(service.remove('wom-1', 'org-1')).rejects.toThrow(
        'Cannot remove a work order material after inventory has been reserved or consumed',
      );

      expect(prisma.work_order_materials.delete).not.toHaveBeenCalled();
    });

    it('rejects removing a work order material after inventory has been consumed', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue({
        id: 'wom-1',
        organization_id: 'org-1',
        reserved_quantity: new Prisma.Decimal(0),
        consumed_quantity: new Prisma.Decimal(5),
      });

      await expect(service.remove('wom-1', 'org-1')).rejects.toThrow(
        'Cannot remove a work order material after inventory has been reserved or consumed',
      );

      expect(prisma.work_order_materials.delete).not.toHaveBeenCalled();
    });

    it('rejects removing a work order material from another organization', async () => {
      prisma.work_order_materials.findFirst.mockResolvedValue(null);

      await expect(service.remove('wom-other', 'org-1')).rejects.toThrow(
        'Work order material not found',
      );

      expect(prisma.work_order_materials.delete).not.toHaveBeenCalled();
    });
  });
});
