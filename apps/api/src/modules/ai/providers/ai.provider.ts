import type { AIAnalysis, AIAnalysisInput } from '../ai.types';

export interface AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysis>;
}
