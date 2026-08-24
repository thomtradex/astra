import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringEngine {
  calculate(data: Record<string, number>) {
    const values = Object.values(data);

    const score =
      values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

    return {
      score,
      level: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
    };
  }
}
