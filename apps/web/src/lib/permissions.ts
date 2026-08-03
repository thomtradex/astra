import type { SessionUser } from './auth';
import type { Permission, SystemRole } from '@astra/shared';

export function hasRole(
  user: SessionUser | null,
  role: SystemRole,
): boolean {
  return user?.roles?.includes(role) ?? false;
}

export function can(
  user: SessionUser | null,
  permission: Permission,
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

export function canAny(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) =>
    can(user, permission),
  );
}

export function canAll(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) =>
    can(user, permission),
  );
}