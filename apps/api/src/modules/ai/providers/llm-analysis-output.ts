export interface LlmAnalysisOutput {
  summary: string;
  rationale: string;
  recommendedRecommendationId: string | null;
  confidence: number;
}
