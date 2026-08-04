export type RiskLevel = "low" | "medium" | "high" | "critical";

export function classifyRisk(score: number): RiskLevel {
  if (score >= 90) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
