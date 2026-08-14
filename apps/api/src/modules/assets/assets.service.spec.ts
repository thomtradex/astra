import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { AssetsService } from './assets.service';

type AssetsDelegate = PrismaService['assets'];

describe('AssetsService', () => {
  let service: AssetsService;

  const prisma = {
    assets: {
      findMany: jest.fn() as jest.MockedFunction<AssetsDelegate['findMany']>,
      findUnique: jest.fn() as jest.MockedFunction<AssetsDelegate['findUnique']>,
      create: jest.fn() as jest.MockedFunction<AssetsDelegate['create']>,
      update: jest.fn() as jest.MockedFunction<AssetsDelegate['update']>,
      delete: jest.fn() as jest.MockedFunction<AssetsDelegate['delete']>,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AssetsService(prisma as unknown as PrismaService);
  });

  it('updates an asset belonging to the organization', async () => {
    const asset = {
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
    };

    const updated = {
      ...asset,
      name: 'Updated',
    };

    prisma.assets.findUnique.mockResolvedValue(asset);
    prisma.assets.update.mockResolvedValue(updated);

    await expect(service.update('asset-1', { name: 'Updated' }, 'org-1')).resolves.toEqual(updated);
  });

  it('throws NotFoundException when the asset does not exist', async () => {
    prisma.assets.findUnique.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'Updated' }, 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when the asset belongs to another organization', async () => {
    prisma.assets.findUnique.mockResolvedValue({
      id: 'asset-1',
      name: 'Asset',
      code: 'AST-001',
      serial_number: null,
      description: null,
      status: 'ACTIVE',
      organization_id: 'org-2',
      site_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await expect(service.update('asset-1', { name: 'Updated' }, 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates an asset', async () => {
    const created = {
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
    };

    prisma.assets.create.mockResolvedValue(created);

    await expect(
      service.create(
        {
          name: 'Asset',
          code: 'AST-001',
        },
        'org-1',
      ),
    ).resolves.toEqual(created);

    expect(prisma.assets.create).toHaveBeenCalledTimes(1);

    const [args] = prisma.assets.create.mock.calls;

    expect(args).toBeDefined();
    expect(args![0].data.name).toBe('Asset');
    expect(args![0].data.code).toBe('AST-001');
    expect(args![0].data.organization_id).toBe('org-1');
  });
});
