import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { IS_PUBLIC_KEY, SKIP_AUDIT_KEY } from '../../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipAudit = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const response = context.switchToHttp().getResponse<Response>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic && request.method === 'GET') {
      return next.handle();
    }

    const organizationId = request.user?.organizationId;

    if (!organizationId) {
      return next.handle();
    }

    const resource = this.extractResource(request.path);

    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditService.log({
            organizationId,
            actorId: request.user?.id,
            action: this.auditService.mapHttpMethodToAction(request.method),
            resource,
            method: request.method,
            path: request.url,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: response.statusCode,
          });
        },
        error: (error: { status?: number; message?: string }) => {
          void this.auditService.log({
            organizationId,
            actorId: request.user?.id,
            action: this.auditService.mapHttpMethodToAction(request.method),
            resource,
            method: request.method,
            path: request.url,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: error.status ?? 500,
            metadata: { error: error.message },
          });
        },
      }),
    );
  }

  private extractResource(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const resourceIndex = segments.findIndex((s) => s === 'v1') + 1;

    return segments[resourceIndex] ?? 'unknown';
  }
}
