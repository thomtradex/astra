export class IntelligenceService {
  analyze(data: {
    delay: number;
    budgetDeviation: number;
    failures: number;
  }) {
    const score =
      data.delay * 0.4 +
      data.budgetDeviation * 0.4 +
      data.failures * 0.2;

    return {
      score: Math.round(score),
      level:
        score >= 70
          ? "HIGH"
          : score >= 40
            ? "MEDIUM"
            : "LOW",
    };
  }
}
