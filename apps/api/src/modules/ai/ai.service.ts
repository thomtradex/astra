import { Inject, Injectable } from '@nestjs/common';

import type {
  AIAnalysis,
  AIAnalysisInput,
} from './ai.types';
import type { AIProvider } from './providers/ai.provider';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  analyze(input: AIAnalysisInput): Promise<AIAnalysis> {
    return this.provider.analyze(input);
  }
}
