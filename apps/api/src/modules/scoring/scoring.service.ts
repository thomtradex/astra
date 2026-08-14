import { Injectable } from '@nestjs/common';

import { ScoringEngine } from './engines/scoring.engine';

@Injectable()
export class ScoringService {
  constructor(
    private readonly engine: ScoringEngine,
  ) {}

  calculate(metrics: Record<string, number>) {
    return this.engine.calculate(metrics);
  }
}
