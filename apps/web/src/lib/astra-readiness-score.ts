export const AstraReadinessScore = {
  calculate(scores: number[]) {
    if (!scores.length) return 0;

    return Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
  },

  status(score:number){
    if(score >= 90) return "elite";
    if(score >= 75) return "enterprise-ready";
    if(score >= 50) return "developing";
    return "foundation";
  }
};
