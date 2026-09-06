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
      (permission) => !context.user.permissions.includes(permission as never),
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

export const CanReadUsers = new PermissionBackedPolicy(
  'CanReadUsers',
  [PERMISSIONS.USER_READ],
);

export const CanManageUsers = new PermissionBackedPolicy(
  'CanManageUsers',
  [PERMISSIONS.USER_WRITE],
);

export const CanReadCustomers = new PermissionBackedPolicy(
  'CanReadCustomers',
  [PERMISSIONS.CUSTOMER_READ],
);

export const CanManageCustomers = new PermissionBackedPolicy(
  'CanManageCustomers',
  [PERMISSIONS.CUSTOMER_WRITE],
);

export const CanReadProjects = new PermissionBackedPolicy(
  'CanReadProjects',
  [PERMISSIONS.PROJECT_READ],
);

export const CanManageProjects = new PermissionBackedPolicy(
  'CanManageProjects',
  [PERMISSIONS.PROJECT_WRITE],
);
