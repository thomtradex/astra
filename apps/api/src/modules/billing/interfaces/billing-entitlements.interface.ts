export interface BillingLimits {
  sites?: number;
  users?: number;
  assets?: number;
  customers?: number;
  storageGb?: number;
  reportsPerMonth?: number;
  maintenancePlans?: number;
  aiRequestsPerMonth?: number;
  workOrdersPerMonth?: number;
  [key: string]: number | undefined;
}

export interface BillingFeatures {
  apiAccess?: boolean;
  auditLogs?: boolean;
  dashboard?: boolean;
  aiAssistant?: boolean;
  customRoles?: boolean;
  forecasting?: boolean;
  basicReports?: boolean;
  intelligence?: boolean;
  siteManagement?: boolean;
  assetManagement?: boolean;
  prioritySupport?: boolean;
  dedicatedSupport?: boolean;
  advancedAnalytics?: boolean;
  advancedAutomation?: boolean;
  customerManagement?: boolean;
  multiSiteOperations?: boolean;
  workOrderManagement?: boolean;
  maintenanceManagement?: boolean;
  customWorkflows?: boolean;
  enterpriseSecurity?: boolean;
  advancedIntegrations?: boolean;
  [key: string]: boolean | undefined;
}

export interface BillingEntitlements {
  plan: {
    id: string;
    code: string;
    name: string;
    monthlyPriceCents: number;
    currency: string;
  };
  limits: BillingLimits;
  features: BillingFeatures;
}
