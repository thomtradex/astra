export function generateRecommendations(risks: string[]) {
  return risks.map((risk) => ({
    risk,
    recommendation: `AI recommendation generated for: ${risk}`,
  }));
}
