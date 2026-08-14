import { AuditAction, Prisma } from '@astra/database';

import { PrismaService } from '../../prisma/prisma.service';

import { AuditService } from './audit.service';
import { AuditLogInput, AuditLogQuery } from './interfaces/audit-log.interface';

describe('AuditService', () => {
  const create = jest.fn<Promise<Prisma.AuditLogGetPayload<object>>, [Prisma.AuditLogCreateArgs]>();

  const findMany = jest.fn<
    Promise<Prisma.AuditLogGetPayload<object>[]>,
    [Prisma.AuditLogFindManyArgs]
  >();

  const count = jest.fn<Promise<number>, [Prisma.AuditLogCountArgs]>();

  const prisma = {
    auditLog: {
      create,
      findMany,
      count,
    },
  } as unknown as PrismaService;

  const service = new AuditService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes an audit log with optional fields normalized', async () => {
    create.mockResolvedValue({
      id: 'audit-1',
      organizationId: 'org-1',
      actorId: null,
      action: AuditAction.CREATE,
      resource: 'assets',
      resourceId: null,
      method: null,
      path: null,
      ipAddress: null,
      userAgent: null,
      statusCode: null,
      metadata: {},
      createdAt: new Date(),
    });

    const input: AuditLogInput = {
      organizationId: 'org-1',
      action: AuditAction.CREATE,
      resource: 'assets',
    };

    await service.log(input);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        actorId: null,
        action: AuditAction.CREATE,
        resource: 'assets',
        resourceId: null,
        method: null,
        path: null,
        ipAddress: null,
        userAgent: null,
        statusCode: null,
        metadata: undefined,
      },
    });
  });

  it('swallows audit persistence failures', async () => {
    create.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.log({
        organizationId: 'org-1',
        action: AuditAction.CREATE,
        resource: 'assets',
      }),
    ).resolves.toBeUndefined();
  });

  it('swallows non-Error audit persistence failures', async () => {
    create.mockRejectedValue('database unavailable');

    await expect(
      service.log({
        organizationId: 'org-1',
        action: AuditAction.CREATE,
        resource: 'assets',
      }),
    ).resolves.toBeUndefined();
  });

  it('findByOrganization applies optional resource and action filters', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    const query: AuditLogQuery = {
      organizationId: 'org-1',
      resource: 'assets',
      action: AuditAction.CREATE,
      page: 1,
      limit: 20,
    };

    const result = await service.findByOrganization(query);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org-1',
          resource: 'assets',
          action: AuditAction.CREATE,
        },
      }),
    );

    expect(count).toHaveBeenCalledWith({
      where: {
        organizationId: 'org-1',
        resource: 'assets',
        action: AuditAction.CREATE,
      },
    });

    expect(result.items).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it('findByOrganization works without optional filters', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    const query: AuditLogQuery = {
      organizationId: 'org-1',
    };

    await service.findByOrganization(query);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org-1',
        },
      }),
    );
  });

  it.each([
    ['POST', AuditAction.CREATE],
    ['PUT', AuditAction.UPDATE],
    ['PATCH', AuditAction.UPDATE],
    ['DELETE', AuditAction.DELETE],
    ['GET', AuditAction.READ],
    ['OPTIONS', AuditAction.READ],
  ])('maps %s to the correct audit action', (method, expected) => {
    expect(service.mapHttpMethodToAction(method)).toBe(expected);
  });
});
