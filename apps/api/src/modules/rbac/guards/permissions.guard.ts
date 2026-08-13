import { AuditAction } from '@astra/database';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
  AUTHENTICATED_KEY,
  IS_PUBLIC_KEY,
  PERMISSIONS_KEY,
} from '../../../common/decorators/metadata.decorators';
import { AuditService } from '../../audit/audit.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every((permission) =>
        user.permissions.includes(permission as AuthenticatedUser['permissions'][number]),
      );

      if (!hasPermission) {
        await this.logAccessDenied(request, user, requiredPermissions, 'missing_permissions');
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    }

    const isAuthenticatedOnly = this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAuthenticatedOnly) {
      return true;
    }

    await this.logAccessDenied(request, user, [], 'missing_authorization_metadata');
    throw new ForbiddenException('Endpoint requires explicit authorization');
  }

  private async logAccessDenied(
    request: Request,
    user: AuthenticatedUser,
    requiredPermissions: string[],
    reason: string,
  ): Promise<void> {
    await this.auditService.log({
      organizationId: user.organizationId,
      actorId: user.id,
      action: AuditAction.ACCESS_DENIED,
      resource: 'rbac',
      method: request.method,
      path: request.url,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      statusCode: 403,
      metadata: {
        reason,
        requiredPermissions,
        userPermissions: user.permissions,
      },
    });
  }
}
