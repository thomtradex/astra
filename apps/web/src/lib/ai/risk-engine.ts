export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export function calculateRisk(delay: number, budgetDeviation: number, failures: number): RiskLevel {
  const score = delay * 0.4 + budgetDeviation * 0.4 + failures * 0.2;

  if (score >= 70) {
    return 'HIGH';
  }

  if (score >= 40) {
    return 'MEDIUM';
  }

  return 'LOW';
}
