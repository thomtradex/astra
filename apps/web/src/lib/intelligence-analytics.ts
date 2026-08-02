export interface AnalyticsOverview {
  riskTrend: string;
  activeSignals: number;
  score: number;
}


export async function getAnalyticsOverview():
Promise<AnalyticsOverview> {

  return {
    riskTrend: 'stable',
    activeSignals: 0,
    score: 0,
  };
}
