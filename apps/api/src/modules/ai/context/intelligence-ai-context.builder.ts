import { Injectable } from '@nestjs/common';

import type { IntelligenceSignal } from '../../intelligence/intelligence.types';
import type { AIAnalysisInput } from '../ai.types';

@Injectable()
export class IntelligenceAiContextBuilder {
  build(signal: IntelligenceSignal): AIAnalysisInput | undefined {
    if (
      !signal.evidenceItems ||
      !signal.operationalContext ||
      !signal.recommendations ||
      !signal.decisionContext
    ) {
      return undefined;
    }

    return {
      signalId: signal.id,
      signalType: signal.type,
      severity: signal.severity,
      title: signal.title,
      explanation: signal.explanation,
      urgency: signal.urgency,
      impact: signal.impact,
      recommendedAction: signal.recommendedAction,
      evidence: signal.evidenceItems,
      operationalContext: signal.operationalContext,
      recommendations: signal.recommendations,
      decisionContext: signal.decisionContext,
    };
  }
}
