import type {
  IntelligenceDecisionContext,
  IntelligenceEvidence,
  IntelligenceRecommendation,
  OperationalContext,
} from './intelligence-contract.types';
import type { OperationalChain } from './operational-chain.types';

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
  /** Structured operational evidence for future consumers and AI interpretation. */
  evidenceItems?: IntelligenceEvidence[];
  impact: string;
  recommendedAction: string;
  operationalContext?: OperationalContext;
  recommendations?: IntelligenceRecommendation[];
  decisionContext?: IntelligenceDecisionContext;
  timestamp: string;
  source: {
    resource: string;
    resourceId: string;
  };
}

export interface IntelligenceDecisionHistory {
  id: string;
  timestamp: string;
  status: 'EXECUTED' | 'DENIED' | 'FAILED';
  actionType: string;
  resource: string;
  resourceId: string;
  actor?: {
    id: string;
    name?: string;
    email?: string;
  };
  message: string;
}

export interface IntelligenceSignal {
  id: string;
  type: IntelligenceSignalType;
  severity: IntelligenceSeverity;
  priorityContext?: {
    openWorkOrders?: number;
    highPriorityOpenWorkOrders?: number;
    unassignedHighPriorityWorkOrders?: number;
    relatedOpenWorkOrders?: number;
  };
  title: string;
  explanation: string;
  evidence: string[];
  /** Structured operational evidence for future consumers and AI interpretation. */
  evidenceItems?: IntelligenceEvidence[];
  urgency: string;
  impact: string;
  operationalContext?: OperationalContext;
  recommendations?: IntelligenceRecommendation[];
  decisionContext?: IntelligenceDecisionContext;
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
