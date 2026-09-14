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

export const CanReadUsers = new PermissionBackedPolicy('CanReadUsers', [PERMISSIONS.USER_READ]);

export const CanManageUsers = new PermissionBackedPolicy('CanManageUsers', [
  PERMISSIONS.USER_WRITE,
]);

export const CanReadOrganizations = new PermissionBackedPolicy('CanReadOrganizations', [
  PERMISSIONS.ORG_READ,
]);

export const CanManageOrganizations = new PermissionBackedPolicy('CanManageOrganizations', [
  PERMISSIONS.ORG_WRITE,
]);

export const CanReadCustomers = new PermissionBackedPolicy('CanReadCustomers', [
  PERMISSIONS.CUSTOMER_READ,
]);

export const CanManageCustomers = new PermissionBackedPolicy('CanManageCustomers', [
  PERMISSIONS.CUSTOMER_WRITE,
]);

export const CanReadProjects = new PermissionBackedPolicy('CanReadProjects', [
  PERMISSIONS.PROJECT_READ,
]);

export const CanManageProjects = new PermissionBackedPolicy('CanManageProjects', [
  PERMISSIONS.PROJECT_WRITE,
]);

export const CanReadAssets = new PermissionBackedPolicy('CanReadAssets', [PERMISSIONS.ASSET_READ]);

export const CanManageAssets = new PermissionBackedPolicy('CanManageAssets', [
  PERMISSIONS.ASSET_WRITE,
]);

export const CanReadSites = new PermissionBackedPolicy('CanReadSites', [PERMISSIONS.SITE_READ]);

export const CanManageSites = new PermissionBackedPolicy('CanManageSites', [
  PERMISSIONS.SITE_WRITE,
]);

export const CanReadWorkOrders = new PermissionBackedPolicy('CanReadWorkOrders', [
  PERMISSIONS.WORK_ORDER_READ,
]);

export const CanManageWorkOrders = new PermissionBackedPolicy('CanManageWorkOrders', [
  PERMISSIONS.WORK_ORDER_WRITE,
]);

export const CanReadMaintenance = new PermissionBackedPolicy('CanReadMaintenance', [
  PERMISSIONS.MAINTENANCE_READ,
]);

export const CanManageMaintenance = new PermissionBackedPolicy('CanManageMaintenance', [
  PERMISSIONS.MAINTENANCE_WRITE,
]);

export const CanReadAudit = new PermissionBackedPolicy('CanReadAudit', [PERMISSIONS.AUDIT_READ]);

export const CanManageBilling = new PermissionBackedPolicy('CanManageBilling', [
  PERMISSIONS.ORG_WRITE,
]);
