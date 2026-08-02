export interface IntelligenceActions {
  pending: number;
  executed: number;
  status: string;
}

export async function getIntelligenceActions():
Promise<IntelligenceActions> {

  return {
    pending: 0,
    executed: 0,
    status: "ready",
  };
}
