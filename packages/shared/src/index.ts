export * from './pagination';

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const PERMISSIONS = {
  // Users
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',

  // Roles & permissions
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',

  // Audit
  AUDIT_READ: 'audit:read',

  // Organization
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [SYSTEM_ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_WRITE,
  ],
  [SYSTEM_ROLES.OPERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ORG_READ,
  ],
  [SYSTEM_ROLES.VIEWER]: [PERMISSIONS.USER_READ, PERMISSIONS.ORG_READ],
};

export interface JwtAccessPayload {
  sub: string;
  email: string;
  organizationId: string;
  roles: SystemRole[];
  permissions: Permission[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  HEALTH: '/health',
  AUDIT: '/audit',
  USERS: '/users',
} as const;
