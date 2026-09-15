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
  action?: IntelligenceSignal['action'];
}

export interface DailyBriefing {
  date: string;
  generatedAt: string;
  summary: DailyBriefingSummary;
  priorities: DailyBriefingPriority[];
  nextStep: string;
}

export interface IntelligenceBriefing {
  generatedAt: string;
  signalCount: number;
  signals: IntelligenceSignal[];
  changes: IntelligenceChange[];
  daily: DailyBriefing;
  decisionMetrics: { executed: number; denied: number; failed: number };
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
