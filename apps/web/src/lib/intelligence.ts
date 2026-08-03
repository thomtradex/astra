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


export interface ExecutiveMetrics {
  users: number;
  risks: number;
  signals: number;
  compliance: number;
}


export async function getExecutiveMetrics():
Promise<ExecutiveMetrics> {

  return {
    users: 0,
    risks: 0,
    signals: 0,
    compliance: 0,
  };
}


