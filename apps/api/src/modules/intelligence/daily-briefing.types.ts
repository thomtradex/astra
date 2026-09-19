import { IntelligenceSeverity, IntelligenceSignal } from './intelligence.types';

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
  source: IntelligenceSignal['source'];
  evidenceItems?: IntelligenceSignal['evidenceItems'];
  operationalContext?: IntelligenceSignal['operationalContext'];
  recommendations?: IntelligenceSignal['recommendations'];
  decisionContext?: IntelligenceSignal['decisionContext'];
  action?: IntelligenceSignal['action'];
}

export interface DailyBriefing {
  date: string;
  generatedAt: string;
  summary: DailyBriefingSummary;
  priorities: DailyBriefingPriority[];
  nextStep: string;
}
