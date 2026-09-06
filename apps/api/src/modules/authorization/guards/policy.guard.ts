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
import { AuthorizationContext } from '../authorization.types';
import {
  CanManageCustomers,
  CanManageProjects,
  CanManageUsers,
  CanReadCustomers,
  CanReadProjects,
  CanReadUsers,
} from '../policies/resource.policies';
import { CanManageWorkOrders } from '../policies/work-order.policies';

@Injectable()
export class PolicyGuard implements CanActivate {
  private readonly policies = new Map([
    [CanReadUsers.name, CanReadUsers],
    [CanManageUsers.name, CanManageUsers],
    [CanReadCustomers.name, CanReadCustomers],
    [CanManageCustomers.name, CanManageCustomers],
    [CanReadProjects.name, CanReadProjects],
    [CanManageProjects.name, CanManageProjects],
    [CanManageWorkOrders.name, CanManageWorkOrders],
  ]);

  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyName = this.reflector.getAllAndOverride<string>(
      AUTHORIZATION_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policyName) {
      return true;
    }

    const policy = this.policies.get(policyName);

    if (!policy) {
      return false;
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
