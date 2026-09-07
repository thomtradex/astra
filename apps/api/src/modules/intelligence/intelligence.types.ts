export type IntelligenceSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IntelligenceSignalType =
  | 'HIGH_PRIORITY_WORK_ORDER'
  | 'OVERDUE_MAINTENANCE'
  | 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER'
  | 'OVERDUE_PROJECT';

export interface IntelligenceSignal {
  id: string;
  type: IntelligenceSignalType;
  severity: IntelligenceSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  urgency: string;
  owner?: {
    type: 'USER' | 'TEAM' | 'ORGANIZATION';
    id?: string;
    name?: string;
  };
  recommendedAction: string;
  decision: {
    type: 'REVIEW';
    label: string;
  };
  action?: {
    type:
      | 'ASSIGN_WORK_ORDER'
      | 'UPDATE_MAINTENANCE'
      | 'SET_PROJECT_STATUS';
    resource:
      | 'work_orders'
      | 'maintenance_plans'
      | 'projects';
    resourceId: string;
    requiresAuthorization: true;
  };
  status: 'OPEN';
  timestamp: string;
  source: {
    resource: string;
    resourceId?: string;
  };
}
