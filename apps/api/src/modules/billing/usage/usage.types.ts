export interface OrganizationUsage {

  organizationId: string;

  users: number;

  sites: number;

  assets: number;

  workOrdersThisMonth: number;

}


export interface UsageWarning {

  metric:
    | 'USERS'
    | 'SITES'
    | 'ASSETS'
    | 'WORK_ORDERS';


  percentageUsed: number;

  message: string;

}
