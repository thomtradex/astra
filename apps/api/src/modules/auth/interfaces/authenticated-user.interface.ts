import { Permission, SystemRole } from '@astra/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string;
  organizationId: string;
  roles: SystemRole[];
  permissions: Permission[];
}
