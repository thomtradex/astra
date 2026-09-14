import { OperationalChain } from './operational-chain.types';

export type IntelligenceSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IntelligenceSignalType =
  | 'HIGH_PRIORITY_WORK_ORDER'
  | 'OVERDUE_MAINTENANCE'
  | 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER'
  | 'UNASSIGNED_WORK_ORDER'
  | 'OVERDUE_PROJECT'
  | 'STALE_OPEN_WORK_ORDER';

export interface IntelligenceChange {
  id: string;
  type: 'PROJECT_CHANGED' | 'WORK_ORDER_CHANGED' | 'MAINTENANCE_CHANGED';
  severity: IntelligenceSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  impact: string;
  recommendedAction: string;
  timestamp: string;
  source: {
    resource: string;
    resourceId: string;
  };
}

export interface IntelligenceSignal {
  id: string;
  type: IntelligenceSignalType;
  severity: IntelligenceSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  urgency: string;
  impact: string;
  owner?: {
    type: 'USER' | 'TEAM' | 'ORGANIZATION';
    id?: string;
    name?: string;
  };
  recommendedAction: string;
  chain?: OperationalChain;
  decision: {
    type: 'REVIEW';
    label: string;
  };
  lastAction?: {
    status: 'EXECUTED' | 'DENIED' | 'FAILED';
    timestamp: string;
    actionType: string;
    message: string;
  };
  action?: {
    type: 'ASSIGN_WORK_ORDER' | 'UPDATE_MAINTENANCE' | 'SET_PROJECT_STATUS';
    resource: 'work_orders' | 'maintenance_plans' | 'projects';
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
