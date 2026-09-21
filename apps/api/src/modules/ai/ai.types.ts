import type {
  IntelligenceDecisionContext,
  IntelligenceEvidence,
  IntelligenceRecommendation,
  OperationalContext,
} from '../intelligence/intelligence-contract.types';

export interface AIAnalysisInput {
  signalId: string;
  signalType: string;
  severity: string;
  title: string;
  explanation: string;
  urgency: string;
  impact: string;
  recommendedAction: string;
  evidence: IntelligenceEvidence[];
  operationalContext: OperationalContext;
  recommendations: IntelligenceRecommendation[];
  decisionContext: IntelligenceDecisionContext;
}

export type AIAnalysisStatus = 'GENERATED' | 'UNAVAILABLE';

export interface AIAnalysis {
  status: AIAnalysisStatus;
  summary: string;
  rationale: string;
  recommendedRecommendationId?: string;
  confidence: number;
  provider: string;
}
