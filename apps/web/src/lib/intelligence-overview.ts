export interface IntelligenceOverview {
  signals: number;
  risks: number;
  actions: number;
  status: string;
}

export async function getIntelligenceOverview():
Promise<IntelligenceOverview> {

  return {
    signals: 0,
    risks: 0,
    actions: 0,
    status: "ready",
  };
}
