import type { OperationalChain } from './operational-chain.types';

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
