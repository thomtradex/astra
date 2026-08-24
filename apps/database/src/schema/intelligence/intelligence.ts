export interface IntelligenceRecord {
  id: string;
  organizationId: string;

  type: 'RISK' | 'PREDICTION' | 'RECOMMENDATION';

  score: number;

  message: string;

  createdAt: Date;
}
