import { Injectable } from '@nestjs/common';

import { AuthorizationPolicy } from './authorization.types';
import { CanReadDashboard } from './policies/dashboard.policies';
import { CanUseIntelligence } from './policies/intelligence.policies';
import {
  CanManageCustomers,
  CanManageOrganizations,
  CanManageProjects,
  CanManageUsers,
  CanManageAssets,
  CanReadAssets,
  CanManageSites,
  CanReadSites,
  CanManageMaintenance,
  CanManageBilling,
  CanReadMaintenance,
  CanReadAudit,
  CanReadCustomers,
  CanReadOrganizations,
  CanReadProjects,
  CanReadUsers,
} from './policies/resource.policies';
import { CanManageWorkOrders, CanReadWorkOrders } from './policies/work-order.policies';

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
    [CanReadDashboard.name, CanReadDashboard],

    [CanReadAssets.name, CanReadAssets],
    [CanManageAssets.name, CanManageAssets],

    [CanReadSites.name, CanReadSites],
    [CanManageSites.name, CanManageSites],

    [CanReadMaintenance.name, CanReadMaintenance],
    [CanManageMaintenance.name, CanManageMaintenance],

    [CanReadWorkOrders.name, CanReadWorkOrders],
    [CanUseIntelligence.name, CanUseIntelligence],
    [CanManageWorkOrders.name, CanManageWorkOrders],
    [CanManageBilling.name, CanManageBilling],
  ]);

  get(name: string): AuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  has(name: string): boolean {
    return this.policies.has(name);
  }
}
