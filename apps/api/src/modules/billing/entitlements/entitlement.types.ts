export type EntitlementFeature =
  | 'INTELLIGENCE'
  | 'COO_ACTIONS'
  | 'ADVANCED_REPORTING'
  | 'UNLIMITED_RESOURCES';

export interface EntitlementCheck {
  feature: EntitlementFeature;
  allowed: boolean;
  reason?: string;
}
