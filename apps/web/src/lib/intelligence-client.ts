import { cookies } from 'next/headers';

import { apiFetch } from './api-client';
import { ACCESS_TOKEN_COOKIE } from './auth-constants';

export type IntelligenceSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IntelligenceSignalType =
  | 'HIGH_PRIORITY_WORK_ORDER'
  | 'OVERDUE_MAINTENANCE'
  | 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER'
  | 'UNASSIGNED_WORK_ORDER'
  | 'OVERDUE_PROJECT'
  | 'STALE_OPEN_WORK_ORDER';

export type OperationalChainNodeType =
  'PROJECT' | 'WORK_ORDER' | 'ASSET' | 'MAINTENANCE' | 'SITE' | 'CUSTOMER';

export interface OperationalChainNode {
  type: OperationalChainNodeType;
  id: string;
  label: string;
  state?: string;
}

export interface OperationalChainEdge {
  from: OperationalChainNode;
  to: OperationalChainNode;
  relationship: string;
}

export interface OperationalChain {
  id: string;
  title: string;
  explanation: string;
  impact: string;
  recommendedAction: string;
  nodes: OperationalChainNode[];
  edges: OperationalChainEdge[];
}

export type IntelligenceEvidenceKind =
  | 'FACT'
  | 'RELATION'
  | 'STATE'
  | 'HISTORY'
  | 'THRESHOLD';

export interface IntelligenceEvidence {
  id: string;
  kind: IntelligenceEvidenceKind;
  label: string;
  value: string;
  source: {
    resource: string;
    resourceId?: string;
  };
}

export interface OperationalContext {
  project?: {
    id: string;
    name?: string;
  };
  asset?: {
    id: string;
    name?: string;
  };
  site?: {
    id: string;
    name?: string;
  };
  maintenance?: {
    id: string;
    nextDue?: string;
  };
  workOrders: {
    open: number;
    highPriorityOpen: number;
    unassignedHighPriority: number;
  };
  chain?: OperationalChain;
}

export type IntelligenceRecommendationType =
  | 'REVIEW'
  | 'ASSIGN'
  | 'RESCHEDULE'
  | 'UPDATE_STATUS'
  | 'MONITOR';

export interface IntelligenceRecommendation {
  id: string;
  type: IntelligenceRecommendationType;
  title: string;
  explanation: string;
  resource: string;
  resourceId: string;
  executable: boolean;
}

export interface IntelligenceDecisionContext {
  evidence: IntelligenceEvidence[];
  operationalContext: OperationalContext;
  recommendations: IntelligenceRecommendation[];
  confidence: number;
}

export interface IntelligenceSignal {
  id: string;
  type: IntelligenceSignalType;
  severity: IntelligenceSeverity;
  title: string;
  explanation: string;
  evidence: string[];
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

export interface DailyBriefingSummary {
  headline: string;
  explanation: string;
  critical: number;
  high: number;
  medium: number;
  total: number;
}

export interface DailyBriefingPriority {
  rank: number;
  severity: IntelligenceSeverity;
  title: string;
  why: string;
  impact: string;
  recommendedAction: string;
  source: {
    resource: string;
    resourceId?: string;
  };
  evidenceItems?: IntelligenceEvidence[];
  operationalContext?: OperationalContext;
  recommendations?: IntelligenceRecommendation[];
  decisionContext?: IntelligenceDecisionContext;
  action?: IntelligenceSignal['action'];
}

export interface DailyBriefing {
  date: string;
  generatedAt: string;
  summary: DailyBriefingSummary;
  priorities: DailyBriefingPriority[];
  nextStep: string;
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

export interface IntelligenceBriefing {
  generatedAt: string;
  signalCount: number;
  signals: IntelligenceSignal[];
  changes: IntelligenceChange[];
  daily: DailyBriefing;
  decisionMetrics: { executed: number; denied: number; failed: number };
  decisionHistory: IntelligenceDecisionHistory[];
}

export async function getIntelligenceBriefing(): Promise<IntelligenceBriefing> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<IntelligenceBriefing>('/intelligence/briefing', { method: 'GET' }, accessToken);
}

export type ExecuteCooActionInput =
  | {
      type: 'ASSIGN_WORK_ORDER';
      resourceId: string;
      assignedToId: string;
    }
  | {
      type: 'UPDATE_MAINTENANCE';
      resourceId: string;
      nextDue: string;
    }
  | {
      type: 'SET_PROJECT_STATUS';
      resourceId: string;
      status: 'ON_HOLD';
    };

export interface CooActionOutcome {
  action: ExecuteCooActionInput;
  allowed: boolean;
  status: 'EXECUTED' | 'DENIED' | 'FAILED';
  resourceId: string;
  message: string;
}

export async function executeCooAction(input: ExecuteCooActionInput): Promise<CooActionOutcome> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error('Unauthenticated');
  }

  return apiFetch<CooActionOutcome>(
    '/intelligence/actions',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
