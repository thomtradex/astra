import { Inject, Injectable } from '@nestjs/common';

import { BillingService } from '../billing/billing.service';
import { UsageService } from '../billing/usage/usage.service';

import type {
  AIAnalysis,
  AIAnalysisInput,
} from './ai.types';
import type { AIProvider } from './providers/ai.provider';
import { DeterministicAiProvider } from './providers/deterministic-ai.provider';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly billingService: BillingService,
    private readonly usageService: UsageService,
    private readonly deterministicProvider: DeterministicAiProvider,
  ) {}

  async analyze(
    organizationId: string,
    input: AIAnalysisInput,
  ): Promise<AIAnalysis> {
    if (!this.provider.isBillable()) {
      return this.provider.analyze(input);
    }

    const entitlements =
      await this.billingService.getEntitlements(organizationId);

    await this.usageService.reserveAiRequest(
      organizationId,
      entitlements.limits.aiRequestsPerMonth ?? Infinity,
    );

    try {
      const analysis = await this.provider.analyze(input);

      if (analysis.status !== 'UNAVAILABLE') {
        return analysis;
      }
    } catch {
      // Uma falha do provider externo não deve bloquear a análise operacional.
    }

    return this.deterministicProvider.analyze(input);
  }
}
