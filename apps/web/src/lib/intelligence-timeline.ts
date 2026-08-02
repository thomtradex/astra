export interface IntelligenceTimeline {
  events: number;
  decisions: number;
  status: string;
}

export async function getIntelligenceTimeline():
Promise<IntelligenceTimeline> {

  return {
    events: 0,
    decisions: 0,
    status: "ready",
  };
}
