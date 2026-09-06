import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationPolicy,
} from '../authorization.types';

export class PermissionPolicy implements AuthorizationPolicy {
  readonly name: string;

  constructor(readonly requiredPermissions: readonly string[]) {
    this.name = `PermissionPolicy(${requiredPermissions.join(',')})`;
  }

  evaluate(context: AuthorizationContext): AuthorizationDecision {
    const missingPermissions = this.requiredPermissions.filter(
      (permission) =>
        !context.user.permissions.includes(
          permission as (typeof context.user.permissions)[number],
        ),
    );

    if (missingPermissions.length > 0) {
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
