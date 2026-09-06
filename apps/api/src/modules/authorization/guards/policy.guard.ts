import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  AUTHORIZATION_POLICY_KEY,
} from '../../../common/decorators/metadata.decorators';

import { AuthorizationService } from '../authorization.service';
import { PolicyRegistry } from '../policy.registry';
import { AuthorizationContext } from '../authorization.types';

@Injectable()
export class PolicyGuard implements CanActivate {


  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
    private readonly policyRegistry: PolicyRegistry,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyName = this.reflector.getAllAndOverride<string>(
      AUTHORIZATION_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policyName) {
      return true;
    }

    const policy = this.policyRegistry.get(policyName);

    if (!policy) {
      throw new Error(
        `Authorization policy not registered: ${policyName}`,
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const authorizationContext: AuthorizationContext = {
      user,
      resource: context.getClass()
        .name.replace('Controller', '')
        .toLowerCase(),
      resourceId: request.params?.id,
      metadata: {
        method: request.method,
        path: request.originalUrl ?? request.url,
      },
    };

    return this.authorizationService.can(policy, authorizationContext);
  }
}
