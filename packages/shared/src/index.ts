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
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  PROJECT_READ: 'project:read',
  PROJECT_WRITE: 'project:write',
  SITE_READ: 'site:read',
  SITE_WRITE: 'site:write',
  ASSET_READ: 'asset:read',
  ASSET_WRITE: 'asset:write',
  WORK_ORDER_READ: 'work_order:read',
  WORK_ORDER_WRITE: 'work_order:write',
  WORK_ORDER_DELETE: 'work_order:delete',
  MAINTENANCE_READ: 'maintenance:read',
  MAINTENANCE_WRITE: 'maintenance:write',

  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_WRITE: 'supplier:write',
  MATERIAL_READ: 'material:read',
  MATERIAL_WRITE: 'material:write',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  WORK_ORDER_MATERIAL_READ: 'work_order_material:read',
  WORK_ORDER_MATERIAL_WRITE: 'work_order_material:write',

  // Roles & permissions
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',

  // Audit
  AUDIT_READ: 'audit:read',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',

  // Organization
  ORG_READ: 'org:read',
  INTELLIGENCE_READ: 'intelligence:read',
  ORG_WRITE: 'org:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [SYSTEM_ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.SUPPLIER_READ,
    PERMISSIONS.SUPPLIER_WRITE,
    PERMISSIONS.MATERIAL_READ,
    PERMISSIONS.MATERIAL_WRITE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.WORK_ORDER_MATERIAL_READ,
    PERMISSIONS.WORK_ORDER_MATERIAL_WRITE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_WRITE,
  ],
  [SYSTEM_ROLES.OPERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.SUPPLIER_READ,
    PERMISSIONS.MATERIAL_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.WORK_ORDER_MATERIAL_READ,
    PERMISSIONS.WORK_ORDER_MATERIAL_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ORG_READ,
  ],
  [SYSTEM_ROLES.VIEWER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.ORG_READ,
  ],
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
