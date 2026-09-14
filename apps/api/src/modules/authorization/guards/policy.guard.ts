import { ForbiddenException } from '@nestjs/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, AUTHENTICATED_KEY } from '../../../common/decorators/metadata.decorators';
import { AUTHORIZATION_POLICY_KEY } from '../../../common/decorators/metadata.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../authorization.service';
import { AuthorizationContext } from '../authorization.types';
import { PolicyRegistry } from '../policy.registry';

interface PolicyRequest {
  user?: AuthenticatedUser;
  params?: { id?: string };
  method: string;
  originalUrl?: string;
  url: string;
}

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
    private readonly policyRegistry: PolicyRegistry,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyName = this.reflector.getAllAndOverride<string>(AUTHORIZATION_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const authenticated = this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (authenticated && !policyName) {
      return true;
    }

    if (!policyName) {
      throw new ForbiddenException('Authorization policy metadata missing');
    }

    const policy = this.policyRegistry.get(policyName);

    if (!policy) {
      throw new Error(`Authorization policy not registered: ${policyName}`);
    }

    const request = context.switchToHttp().getRequest<PolicyRequest>();
    const user = request.user;

    if (!user) {
      throw new Error('Authorization failed: missing authenticated user');
    }

    const authorizationContext: AuthorizationContext = {
      user,
      resource: context.getClass().name.replace('Controller', '').toLowerCase(),
      resourceId: request.params?.id,
      metadata: {
        method: request.method,
        path: request.originalUrl ?? request.url,
      },
    };

    return this.authorizationService.can(policy, authorizationContext);
  }
}
