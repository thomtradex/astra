import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { Request, Response } from 'express';

import {
  IS_PUBLIC_KEY,
  SKIP_AUDIT_KEY,
} from '../../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const skipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthenticatedUser }
    >();

    const response = context.switchToHttp().getResponse<Response>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic && request.method === 'GET') {
      return next.handle();
    }

    const resource = this.extractResource(request.path);
    const organizationId = request.user?.organizationId ?? 'system';

    const createAudit = (statusCode: number, metadata?: object) =>
      from(
        this.auditService.log({
          organizationId,
          actorId: request.user?.id,
          action: this.auditService.mapHttpMethodToAction(request.method),
          resource,
          method: request.method,
          path: request.url,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          statusCode,
          metadata,
        }),
      ).pipe(
        catchError(() => from([])),
      );

    return next.handle().pipe(
      mergeMap((result) =>
        createAudit(response.statusCode).pipe(
          map(() => result),
        ),
      ),
      catchError((error: { status?: number; message?: string }) =>
        createAudit(error.status ?? 500, {
          error: error.message,
        }).pipe(
          mergeMap(() => {
            throw error;
          }),
        ),
      ),
    );
  }

  private extractResource(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const resourceIndex = segments.findIndex((s) => s === 'v1') + 1;

    return segments[resourceIndex] ?? 'unknown';
  }
}
