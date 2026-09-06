import { Injectable } from '@nestjs/common';

import {
  CanManageCustomers,
  CanManageOrganizations,
  CanManageProjects,
  CanManageUsers,
  CanReadAudit,
  CanReadCustomers,
  CanReadOrganizations,
  CanReadProjects,
  CanReadUsers,
} from './policies/resource.policies';

import {
  CanManageWorkOrders,
  CanReadWorkOrders,
} from './policies/work-order.policies';

import { AuthorizationPolicy } from './authorization.types';

@Injectable()
export class PolicyRegistry {
  private readonly policies = new Map<string, AuthorizationPolicy>([
    [CanReadUsers.name, CanReadUsers],
    [CanManageUsers.name, CanManageUsers],

    [CanReadOrganizations.name, CanReadOrganizations],
    [CanManageOrganizations.name, CanManageOrganizations],

    [CanReadCustomers.name, CanReadCustomers],
    [CanManageCustomers.name, CanManageCustomers],

    [CanReadProjects.name, CanReadProjects],
    [CanManageProjects.name, CanManageProjects],

    [CanReadAudit.name, CanReadAudit],

    [CanReadWorkOrders.name, CanReadWorkOrders],
    [CanManageWorkOrders.name, CanManageWorkOrders],
  ]);

  get(name: string): AuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  has(name: string): boolean {
    return this.policies.has(name);
  }
}
