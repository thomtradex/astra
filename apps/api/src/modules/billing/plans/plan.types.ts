export enum AstraPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export interface PlanLimits {
  maxUsers: number;
  maxSites: number;
  maxAssets: number;
  maxWorkOrdersPerMonth: number;
  intelligenceEnabled: boolean;
  cooActionsEnabled: boolean;
  advancedReportingEnabled: boolean;
}

export const PLAN_LIMITS: Record<AstraPlan, PlanLimits> = {
  FREE: {
    maxUsers: 2,
    maxSites: 1,
    maxAssets: 25,
    maxWorkOrdersPerMonth: 20,
    intelligenceEnabled: false,
    cooActionsEnabled: false,
    advancedReportingEnabled: false,
  },

  STARTER: {
    maxUsers: 10,
    maxSites: 5,
    maxAssets: 250,
    maxWorkOrdersPerMonth: 500,
    intelligenceEnabled: true,
    cooActionsEnabled: false,
    advancedReportingEnabled: false,
  },

  PROFESSIONAL: {
    maxUsers: 50,
    maxSites: 25,
    maxAssets: 2000,
    maxWorkOrdersPerMonth: 5000,
    intelligenceEnabled: true,
    cooActionsEnabled: true,
    advancedReportingEnabled: true,
  },

  ENTERPRISE: {
    maxUsers: Infinity,
    maxSites: Infinity,
    maxAssets: Infinity,
    maxWorkOrdersPerMonth: Infinity,
    intelligenceEnabled: true,
    cooActionsEnabled: true,
    advancedReportingEnabled: true,
  },
};
