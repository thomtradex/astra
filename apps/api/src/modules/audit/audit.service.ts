import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@astra/database';
import {
  buildPaginatedResult,
  normalizePagination,
  type PaginatedResult,
} from '@astra/shared';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogInput, AuditLogQuery } from './interfaces/audit-log.interface';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: input.organizationId },
      });

      if (!organization) {
        this.logger.warn(
          `Skipping audit log. Organization not found: ${input.organizationId}`,
        );
        return;
      }

      await this.prisma.auditLog.create({
        data: {
          organizationId: input.organizationId,
          actorId: input.actorId ?? null,
          action: input.action,
          resource: input.resource,
          resourceId: input.resourceId ?? null,
          method: input.method ?? null,
          path: input.path ?? null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          statusCode: input.statusCode ?? null,
          metadata: input.metadata ?? undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to write audit log',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async findByOrganization(
    query: AuditLogQuery,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<AuditService['findAuditRecords']>>[number]
    >
  > {
    const { page, limit, skip } = normalizePagination(
      query.page,
      query.limit,
    );

    const where = {
      organizationId: query.organizationId,
      ...(query.resource ? { resource: query.resource } : {}),
      ...(query.action ? { action: query.action } : {}),
    };

    const [items, total] = await Promise.all([
      this.findAuditRecords(where, skip, limit),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, limit);
  }

  private findAuditRecords(
    where: {
      organizationId: string;
      resource?: string;
      action?: AuditAction;
    },
    skip: number,
    take: number,
  ) {
    return this.prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  mapHttpMethodToAction(method: string): AuditAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;

      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;

      case 'DELETE':
        return AuditAction.DELETE;

      case 'GET':
      default:
        return AuditAction.READ;
    }
  }
}