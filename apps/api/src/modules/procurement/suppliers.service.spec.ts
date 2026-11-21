import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { SuppliersService } from './suppliers.service';

type SuppliersDelegate = PrismaService['suppliers'];

describe('SuppliersService', () => {
  let service: SuppliersService;

  const prisma = {
    suppliers: {
      findMany: jest.fn() as jest.MockedFunction<SuppliersDelegate['findMany']>,
      findFirst: jest.fn() as jest.MockedFunction<SuppliersDelegate['findFirst']>,
      create: jest.fn() as jest.MockedFunction<SuppliersDelegate['create']>,
      update: jest.fn() as jest.MockedFunction<SuppliersDelegate['update']>,
      delete: jest.fn() as jest.MockedFunction<SuppliersDelegate['delete']>,
    },
  };

  const supplier = {
    id: 'supplier-1',
    organization_id: 'org-1',
    code: 'SUP-001',
    name: 'Supplier One',
    tax_id: null,
    email: 'supplier@example.com',
    phone: null,
    address: null,
    lead_time_days: 7,
    active: true,
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new SuppliersService(prisma as unknown as PrismaService);
  });

  it('finds suppliers only from the organization', async () => {
    prisma.suppliers.findMany.mockResolvedValue([supplier]);

    await expect(service.findAll('org-1')).resolves.toEqual([supplier]);

    expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('finds a supplier only from the organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(supplier);

    await expect(service.findOne('supplier-1', 'org-1')).resolves.toEqual(supplier);

    expect(prisma.suppliers.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'supplier-1',
        organization_id: 'org-1',
      },
    });
  });

  it('throws when the supplier does not belong to the organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(null);

    await expect(service.findOne('supplier-1', 'org-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a supplier scoped to the organization', async () => {
    prisma.suppliers.create.mockResolvedValue(supplier);

    await expect(
      service.create(
        {
          code: 'SUP-001',
          name: 'Supplier One',
          email: 'supplier@example.com',
          leadTimeDays: 7,
        },
        'org-1',
      ),
    ).resolves.toEqual(supplier);

    expect(prisma.suppliers.create).toHaveBeenCalledTimes(1);

    const createCalls = prisma.suppliers.create.mock.calls;
    expect(createCalls).toHaveLength(1);

    const createData = createCalls[0]?.[0]?.data;
    expect(createData).toMatchObject({
      organization_id: 'org-1',
      code: 'SUP-001',
      name: 'Supplier One',
      lead_time_days: 7,
    });
  });

  it('updates a supplier only after verifying organization ownership', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(supplier);
    prisma.suppliers.update.mockResolvedValue({
      ...supplier,
      name: 'Updated Supplier',
    });

    await expect(
      service.update(
        'supplier-1',
        {
          name: 'Updated Supplier',
        },
        'org-1',
      ),
    ).resolves.toMatchObject({
      name: 'Updated Supplier',
    });

    expect(prisma.suppliers.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'supplier-1',
        organization_id: 'org-1',
      },
    });

    const updateCalls = prisma.suppliers.update.mock.calls;
    expect(updateCalls).toHaveLength(1);

    const updateArgs = updateCalls[0]?.[0];
    expect(updateArgs).toMatchObject({
      where: {
        id: 'supplier-1',
      },
      data: {
        name: 'Updated Supplier',
      },
    });
    expect(updateArgs?.data.updated_at).toBeInstanceOf(Date);
  });

  it('does not update a supplier from another organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(null);

    await expect(
      service.update(
        'supplier-1',
        {
          name: 'Should Not Update',
        },
        'org-2',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.suppliers.update).not.toHaveBeenCalled();
  });

  it('removes a supplier only after verifying organization ownership', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(supplier);
    prisma.suppliers.delete.mockResolvedValue(supplier);

    await expect(service.remove('supplier-1', 'org-1')).resolves.toEqual(supplier);

    expect(prisma.suppliers.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'supplier-1',
        organization_id: 'org-1',
      },
    });

    expect(prisma.suppliers.delete).toHaveBeenCalledWith({
      where: {
        id: 'supplier-1',
      },
    });
  });

  it('does not remove a supplier from another organization', async () => {
    prisma.suppliers.findFirst.mockResolvedValue(null);

    await expect(service.remove('supplier-1', 'org-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.suppliers.delete).not.toHaveBeenCalled();
  });
});
