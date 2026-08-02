import { AuditAction, Prisma } from '@astra/database';

export interface AuditLogInput {
  organizationId: string;
  actorId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  method?: string | null;
  path?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  metadata?: Prisma.InputJsonValue;
}

export interface AuditLogQuery {
  organizationId: string;
  page?: number;
  limit?: number;
  resource?: string;
  action?: AuditAction;
  resourceId?: string;
}
