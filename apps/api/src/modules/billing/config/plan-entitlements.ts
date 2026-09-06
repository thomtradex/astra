export const PLAN_ENTITLEMENTS = {
  FREE: {
    assets: 25,
    users: 3,
    customers: 50,
    projects: 3,
    workOrders: 50,

    features: [
      'dashboard',
      'assets',
      'maintenance',
      'basic_reports',
    ],
  },

  STARTER: {
    assets: 250,
    users: 10,
    customers: 500,
    projects: 25,
    workOrders: 500,

    features: [
      'dashboard',
      'assets',
      'maintenance',
      'customers',
      'projects',
      'work_orders',
      'reports',
    ],
  },

  PROFESSIONAL: {
    assets: 2000,
    users: 50,
    customers: 5000,
    projects: 250,
    workOrders: 5000,

    features: [
      'dashboard',
      'assets',
      'maintenance',
      'customers',
      'projects',
      'work_orders',
      'reports',
      'intelligence',
      'advanced_analytics',
    ],
  },

  ENTERPRISE: {
    assets: -1,
    users: -1,
    customers: -1,
    projects: -1,
    workOrders: -1,

    features: [
      'dashboard',
      'assets',
      'maintenance',
      'customers',
      'projects',
      'work_orders',
      'reports',
      'intelligence',
      'advanced_analytics',
      'enterprise_support',
      'custom_integrations',
    ],
  },
} as const;
