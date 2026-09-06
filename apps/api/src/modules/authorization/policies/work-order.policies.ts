import { PERMISSIONS } from '@astra/shared';

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationPolicy,
} from '../authorization.types';

class PermissionBackedPolicy implements AuthorizationPolicy {
  constructor(
    public readonly name: string,
    public readonly requiredPermissions: readonly string[],
  ) {}

  evaluate(context: AuthorizationContext): AuthorizationDecision {
    const missing = this.requiredPermissions.filter(
      (permission) =>
        !context.user.permissions.includes(
          permission as (typeof context.user.permissions)[number],
        ),
    );

    if (missing.length > 0) {
      return {
        allowed: false,
        policy: this.name,
        reason: 'missing_permissions',
        requiredPermissions: [...this.requiredPermissions],
      };
    }

    return {
      allowed: true,
      policy: this.name,
      reason: 'permissions_satisfied',
      requiredPermissions: [...this.requiredPermissions],
    };
  }
}

export const CanManageWorkOrders = new PermissionBackedPolicy(
  'CanManageWorkOrders',
  [PERMISSIONS.WORK_ORDER_WRITE],
);
