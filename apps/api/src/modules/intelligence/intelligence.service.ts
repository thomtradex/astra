import { Injectable } from '@nestjs/common';

import { IntelligenceEngine } from './engines/intelligence.engine';

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly engine: IntelligenceEngine,
  ) {}

  analyze(data: Record<string, unknown>) {
    return this.engine.analyze(data);
  }
}
