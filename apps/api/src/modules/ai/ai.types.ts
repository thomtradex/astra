import type {
  IntelligenceDecisionContext,
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
  decisionContext: IntelligenceDecisionContext;
}

export type AIAnalysisStatus = 'GENERATED' | 'UNAVAILABLE';

export type AIAnalysisConfidenceSource =
  | 'DETERMINISTIC_RULE'
  | 'LLM'
  | 'UNAVAILABLE';

export interface AIAnalysis {
  status: AIAnalysisStatus;
  summary: string;
  rationale: string;
  recommendedRecommendationId?: string;
  confidence: number;
  confidenceSource: AIAnalysisConfidenceSource;
  provider: string;
}
