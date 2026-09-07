import { PermissionPolicy } from './permission.policy';
import { PERMISSIONS } from '@astra/shared';

export const CanUseIntelligence = new PermissionPolicy([
  'intelligence:read',
]);
