export interface IntelligenceOverview {
  signals: number;
  risks: number;
}


export async function getIntelligenceOverview():
Promise<IntelligenceOverview> {

  return {
    signals: 0,
    risks: 0,
  };
}
