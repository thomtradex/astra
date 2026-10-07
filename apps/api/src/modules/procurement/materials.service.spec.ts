import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { MaterialsService } from './materials.service';

type MaterialsDelegate = PrismaService['materials'];
type SuppliersDelegate = PrismaService['suppliers'];

describe('MaterialsService', () => {
  let service: MaterialsService;

  const prisma = {
    materials: {
      findMany: jest.fn() as jest.MockedFunction<MaterialsDelegate['findMany']>,
      findFirst: jest.fn() as jest.MockedFunction<MaterialsDelegate['findFirst']>,
      create: jest.fn() as jest.MockedFunction<MaterialsDelegate['create']>,
      update: jest.fn() as jest.MockedFunction<MaterialsDelegate['update']>,
      delete: jest.fn() as jest.MockedFunction<MaterialsDelegate['delete']>,
    },
    suppliers: {
      findFirst: jest.fn() as jest.MockedFunction<SuppliersDelegate['findFirst']>,
    },
  };

  const material = {
    id: 'material-1',
    organization_id: 'org-1',
    supplier_id: 'supplier-1',
    code: 'MAT-001',
    name: 'Cement',
    description: null,
    category: 'Construction',
    unit: 'kg',
    unit_cost: null,
    lead_time_days: 5,
    reorder_point: null,
    reorder_quantity: null,
    active: true,
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new MaterialsService(prisma as unknown as PrismaService);
  });

  it('finds materials only from the organization', async () => {
    prisma.materials.findMany.mockResolvedValue([material]);

    await expect(service.findAll('org-1')).resolves.toEqual([material]);

    expect(prisma.materials.findMany).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('finds a material only from the organization', async () => {
    prisma.materials.findFirst.mockResolvedValue(material);

    await expect(service.findOne('material-1', 'org-1')).resolves.toEqual(material);

    expect(prisma.materials.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'material-1',
        organization_id: 'org-1',
      },
    });
  });

  it('throws when the material does not belong to the organization', async () => {
    prisma.materials.findFirst.mockResolvedValue(null);

    await expect(service.findOne('material-1', 'org-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a material without a supplier', async () => {
    const created = {
      ...material,
      supplier_id: null,
    };

    prisma.materials.create.mockResolvedValue(created);

    await expect(
      service.create(
        {
          code: 'MAT-001',
          name: 'Cement',
          unit: 'kg',
        },
        'org-1',
      ),
    ).resolves.toEqual(created);

    expect(prisma.suppliers.findFirst).not.toHaveBeenCalled();
    expect(prisma.materials.create).toHaveBeenCalledTimes(1);

    const createCalls = prisma.materials.create.mock.calls;
    expect(createCalls).toHaveLength(1);

    const createData = createCalls[0]?.[0]?.data;
    expect(createData).toMatchObject({
      organization_id: 'org-1',
      supplier_id: undefined,
      code: 'MAT-001',
      name: 'Cement',
    });
  });

  it('creates a material with a supplier from the same organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue({
      id: 'supplier-1',
    } as never);

    prisma.materials.create.mockResolvedValue(material);

    await expect(
      service.create(
        {
          code: 'MAT-001',
          name: 'Cement',
          unit: 'kg',
          supplierId: 'supplier-1',
          unitCost: 7.5,
          leadTimeDays: 5,
        },
        'org-1',
      ),
    ).resolves.toEqual(material);

    expect(prisma.suppliers.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'supplier-1',
        organization_id: 'org-1',
      },
      select: {
        id: true,
      },
    });

    const createCalls = prisma.materials.create.mock.calls;
    expect(createCalls).toHaveLength(1);

    const createData = createCalls[0]?.[0]?.data;
    expect(createData).toMatchObject({
      organization_id: 'org-1',
      supplier_id: 'supplier-1',
      unit_cost: 7.5,
    });
  });

  it('rejects a supplier from another organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          code: 'MAT-001',
          name: 'Cement',
          unit: 'kg',
          supplierId: 'supplier-other-org',
        },
        'org-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.materials.create).not.toHaveBeenCalled();
  });

  it('updates a material only after verifying organization ownership', async () => {
    prisma.materials.findFirst.mockResolvedValue(material);
    prisma.suppliers.findFirst.mockResolvedValue({
      id: 'supplier-2',
    } as never);
    prisma.materials.update.mockResolvedValue({
      ...material,
      name: 'Updated Cement',
      supplier_id: 'supplier-2',
    });

    await expect(
      service.update(
        'material-1',
        {
          name: 'Updated Cement',
          supplierId: 'supplier-2',
        },
        'org-1',
      ),
    ).resolves.toMatchObject({
      name: 'Updated Cement',
      supplier_id: 'supplier-2',
    });

    expect(prisma.materials.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'material-1',
        organization_id: 'org-1',
      },
    });

    expect(prisma.suppliers.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'supplier-2',
        organization_id: 'org-1',
      },
      select: {
        id: true,
      },
    });

    const updateCalls = prisma.materials.update.mock.calls;
    expect(updateCalls).toHaveLength(1);

    const updateArgs = updateCalls[0]?.[0];
    expect(updateArgs).toMatchObject({
      where: {
        id: 'material-1',
      },
      data: {
        name: 'Updated Cement',
        supplier_id: 'supplier-2',
      },
    });
    expect(updateArgs?.data.updated_at).toBeInstanceOf(Date);
  });

  it('does not update a material with a supplier from another organization', async () => {
    prisma.materials.findFirst.mockResolvedValue(material);
    prisma.suppliers.findFirst.mockResolvedValue(null);

    await expect(
      service.update(
        'material-1',
        {
          supplierId: 'supplier-other-org',
        },
        'org-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.materials.update).not.toHaveBeenCalled();
  });

  it('removes a material only after verifying organization ownership', async () => {
    prisma.materials.findFirst.mockResolvedValue(material);
    prisma.materials.delete.mockResolvedValue(material);

    await expect(service.remove('material-1', 'org-1')).resolves.toEqual(material);

    expect(prisma.materials.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'material-1',
        organization_id: 'org-1',
      },
    });

    expect(prisma.materials.delete).toHaveBeenCalledWith({
      where: {
        id: 'material-1',
      },
    });
  });

  it('does not remove a material from another organization', async () => {
    prisma.materials.findFirst.mockResolvedValue(null);

    await expect(service.remove('material-1', 'org-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.materials.delete).not.toHaveBeenCalled();
  });
});
