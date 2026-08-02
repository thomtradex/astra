import type { SessionUser } from './auth';

export function hasRole(
  user: SessionUser | null,
  role: string,
): boolean {
  return user?.roles?.includes(role) ?? false;
}

export function can(
  user: SessionUser | null,
  permission: string,
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

export function canAny(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  return permissions.some((permission) =>
    can(user, permission),
  );
}

export function canAll(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  return permissions.every((permission) =>
    can(user, permission),
  );
}