import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { SitesService } from './sites.service';

type SitesDelegate = PrismaService['sites'];

describe('SitesService', () => {
  let service: SitesService;

  const prisma = {
    sites: {
      findMany: jest.fn() as jest.MockedFunction<SitesDelegate['findMany']>,
      findUnique: jest.fn() as jest.MockedFunction<SitesDelegate['findUnique']>,
      create: jest.fn() as jest.MockedFunction<SitesDelegate['create']>,
      update: jest.fn() as jest.MockedFunction<SitesDelegate['update']>,
      delete: jest.fn() as jest.MockedFunction<SitesDelegate['delete']>,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new SitesService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('returns sites for the organization ordered by created_at desc', async () => {
      const sites = [{ id: 'site-1' }, { id: 'site-2' }];

      prisma.sites.findMany.mockResolvedValue(sites);

      await expect(service.findAll('org-1')).resolves.toEqual(sites);

      expect(prisma.sites.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1' },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a site using id and organization_id', async () => {
      const site = {
        id: 'site-1',
        organization_id: 'org-1',
      };

      prisma.sites.findUnique.mockResolvedValue(site);

      await expect(service.findOne('site-1', 'org-1')).resolves.toEqual(site);

      expect(prisma.sites.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'site-1',
          organization_id: 'org-1',
        },
      });
    });

    it('returns null when the site does not exist', async () => {
      prisma.sites.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'org-1')).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('creates a site with organization_id', async () => {
      const created = {
        id: 'site-1',
        name: 'Lisbon',
        code: 'LIS',
        organization_id: 'org-1',
      };

      prisma.sites.create.mockResolvedValue(created);

      const result = await service.create(
        {
          name: 'Lisbon',
          code: 'LIS',
        },
        'org-1',
      );

      expect(result).toEqual(created);

      expect(prisma.sites.create).toHaveBeenCalledTimes(1);

      const call = prisma.sites.create.mock.calls[0];
      expect(call).toBeDefined();
      const createArgs = call![0];

      expect(createArgs.data).toMatchObject({
        name: 'Lisbon',
        code: 'LIS',
        organization_id: 'org-1',
      });

      expect(createArgs.data.id).toEqual(expect.any(String));
      expect(createArgs.data.updated_at).toEqual(expect.any(Date));
    });
  });

  describe('update', () => {
    it('updates a site belonging to the organization', async () => {
      const site = {
        id: 'site-1',
        organization_id: 'org-1',
      };

      const updated = {
        ...site,
        name: 'Updated',
      };

      prisma.sites.findUnique.mockResolvedValue(site);
      prisma.sites.update.mockResolvedValue(updated);

      await expect(service.update('site-1', { name: 'Updated' }, 'org-1')).resolves.toEqual(
        updated,
      );

      expect(prisma.sites.findUnique).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });

      expect(prisma.sites.update).toHaveBeenCalledWith({
        where: { id: 'site-1' },
        data: { name: 'Updated' },
      });
    });

    it('throws NotFoundException when the site does not exist', async () => {
      prisma.sites.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'Updated' }, 'org-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.sites.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the site belongs to another organization', async () => {
      prisma.sites.findUnique.mockResolvedValue({
        id: 'site-1',
        organization_id: 'org-2',
      });

      await expect(service.update('site-1', { name: 'Updated' }, 'org-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.sites.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a site belonging to the organization', async () => {
      const site = {
        id: 'site-1',
        organization_id: 'org-1',
      };

      prisma.sites.findUnique.mockResolvedValue(site);
      prisma.sites.delete.mockResolvedValue(site);

      await expect(service.remove('site-1', 'org-1')).resolves.toEqual(site);

      expect(prisma.sites.delete).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });
    });

    it('throws NotFoundException when the site does not exist', async () => {
      prisma.sites.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 'org-1')).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.sites.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the site belongs to another organization', async () => {
      prisma.sites.findUnique.mockResolvedValue({
        id: 'site-1',
        organization_id: 'org-2',
      });

      await expect(service.remove('site-1', 'org-1')).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.sites.delete).not.toHaveBeenCalled();
    });
  });
});
