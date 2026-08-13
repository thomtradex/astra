import { ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  const prisma = {
    organization: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new OrganizationsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when findOne cannot find the organization', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);

    await expect(service.findOne('org-missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('finds organizations without a search filter', async () => {
    prisma.organization.findMany.mockResolvedValue([
      { id: 'org-1', name: 'Alpha', slug: 'alpha' },
    ]);
    prisma.organization.count.mockResolvedValue(1);

    const result = await service.findAll({});

    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
    expect(result.items).toHaveLength(1);
  });

  it('finds organizations using the search filter', async () => {
    prisma.organization.findMany.mockResolvedValue([]);
    prisma.organization.count.mockResolvedValue(0);

    await service.findAll({ search: 'alpha' });

    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              name: {
                contains: 'alpha',
                mode: 'insensitive',
              },
            },
            {
              slug: {
                contains: 'alpha',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    );
  });

  it('throws when create finds an existing slug', async () => {
    prisma.organization.findUnique.mockResolvedValue({ id: 'org-1' });

    await expect(
      service.create({
        name: 'New Organization',
        slug: 'Existing-Slug',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates an organization with normalized values', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    prisma.organization.create.mockResolvedValue({
      id: 'org-1',
      name: 'New Organization',
      slug: 'new-organization',
    });

    await service.create({
      name: ' New Organization ',
      slug: ' New-Organization ',
    });

    expect(prisma.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'New Organization',
          slug: 'new-organization',
        },
      }),
    );
  });

  it('updates an organization without changing its slug', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org-1',
      name: 'Old Name',
      slug: 'old-slug',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.organization.update.mockResolvedValue({
      id: 'org-1',
      name: 'New Name',
      slug: 'old-slug',
    });

    await service.update('org-1', { name: ' New Name ' });

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'New Name',
        },
      }),
    );
  });

  it('updates an organization without name or slug changes', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'organization',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.organization.update.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'organization',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.update('org-1', {});

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org-1' },
        data: {},
      }),
    );

    expect(result.id).toBe('org-1');
  });

  it('updates with an empty normalized slug without checking conflicts', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'organization',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.organization.update.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: '',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.update('org-1', {
      slug: '   ',
    });

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org-1' },
        data: { slug: '' },
      }),
    );

    expect(result.slug).toBe('');
  });

  it('sets an organization active state', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'organization',
      is_active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.organization.update.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'organization',
      is_active: true,
    });

    const result = await service.setActive('org-1', true);

    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org-1' },
        data: { is_active: true },
      }),
    );

    expect(result.is_active).toBe(true);
  });

  it('throws when update finds a conflicting slug', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org-1',
      name: 'Organization',
      slug: 'org-1',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    prisma.organization.findFirst.mockResolvedValue({
      id: 'org-2',
    });

    await expect(
      service.update('org-1', { slug: 'Existing-Slug' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
