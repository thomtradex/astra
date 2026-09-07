import { PERMISSIONS } from '@astra/shared';

import { PermissionPolicy } from './permission.policy';

export const CanReadDashboard = new PermissionPolicy([
  PERMISSIONS.DASHBOARD_READ,
]);
