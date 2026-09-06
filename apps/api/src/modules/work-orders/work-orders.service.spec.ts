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
    },
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
    service = new WorkOrdersService(prisma as never);
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
          updated_at: expect.any(Date),
        }),
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
        }),
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
        }),
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
        }),
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
});
