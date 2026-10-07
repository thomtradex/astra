import { Test, TestingModule } from '@nestjs/testing';

import { BillingService } from '../billing/billing.service';
import { UsageLimitExceededException } from '../billing/usage/usage-limit-exceeded.exception';
import { UsageService } from '../billing/usage/usage.service';

import { AI_PROVIDER, AiService } from './ai.service';
import type { AIAnalysisInput } from './ai.types';

describe('AiService', () => {
  let service: AiService;
  let provider: {
    analyze: jest.Mock;
    isBillable: jest.Mock;
  };
  let billingService: {
    getEntitlements: jest.Mock;
  };
  let usageService: {
    reserveAiRequest: jest.Mock;
  };

  const input: AIAnalysisInput = {
    signalId: 'signal-1',
    signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
    severity: 'HIGH',
    title: 'Ordem sem responsável',
    explanation: 'A ordem de trabalho não tem responsável.',
    urgency: 'Requer atenção hoje.',
    impact: 'Pode atrasar a operação.',
    recommendedAction: 'Atribuir um responsável.',
    signalSource: {
      resource: 'work_orders',
      resourceId: 'work-order-1',
    },
    decisionContext: {
      evidence: [
        {
          id: 'evidence-1',
          kind: 'FACT',
          label: 'Prioridade',
          value: 'HIGH',
          source: {
            resource: 'work_orders',
            resourceId: 'wo-1',
          },
        },
      ],
      operationalContext: {
        workOrders: {
          open: 1,
          highPriorityOpen: 1,
          unassignedHighPriority: 1,
        },
      },
      recommendations: [
        {
          id: 'recommendation-1',
          type: 'ASSIGN',
          title: 'Atribuir responsável',
          explanation: 'Definir um responsável operacional.',
          resource: 'work_orders',
          resourceId: 'wo-1',
          executable: true,
        },
      ],
      confidence: 1,
    },
  };

  beforeEach(async () => {
    provider = {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED' as const,
        summary: 'Análise AI.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'openai',
      }),
      isBillable: jest.fn().mockReturnValue(true),
    };

    billingService = {
      getEntitlements: jest.fn().mockResolvedValue({
        plan: {
          id: 'plan-professional',
          code: 'PROFESSIONAL',
          name: 'Professional',
          monthlyPriceCents: 24900,
          currency: 'EUR',
        },
        limits: {
          aiRequestsPerMonth: 1000,
        },
        features: {
          intelligence: true,
        },
      }),
    };

    usageService = {
      reserveAiRequest: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_PROVIDER,
          useValue: provider,
        },
        {
          provide: BillingService,
          useValue: billingService,
        },
        {
          provide: UsageService,
          useValue: usageService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not consume AI quota for a non-billable deterministic provider', async () => {
    provider.isBillable.mockReturnValue(false);
    provider.analyze.mockResolvedValue({
      status: 'GENERATED' as const,
      summary: 'Análise determinística.',
      rationale: 'Contexto operacional analisado.',
      confidence: 1,
      provider: 'deterministic',
    });

    await expect(
      service.analyze('org-1', input),
    ).resolves.toMatchObject({
      status: 'GENERATED',
      provider: 'deterministic',
    });

    expect(billingService.getEntitlements).not.toHaveBeenCalled();
    expect(usageService.reserveAiRequest).not.toHaveBeenCalled();
    expect(provider.analyze).toHaveBeenCalledWith(input);
  });

  it('reserves the plan AI quota before a billable provider call', async () => {
    await expect(
      service.analyze('org-1', input),
    ).resolves.toMatchObject({
      status: 'GENERATED',
      provider: 'openai',
    });

    expect(billingService.getEntitlements).toHaveBeenCalledWith('org-1');
    expect(usageService.reserveAiRequest).toHaveBeenCalledWith(
      'org-1',
      1000,
    );
    expect(provider.analyze).toHaveBeenCalledWith(input);
  });

  it('does not consume quota when the configured provider is unavailable', async () => {
    provider.isBillable.mockReturnValue(false);
    provider.analyze.mockResolvedValue({
      status: 'UNAVAILABLE' as const,
      summary: 'A análise AI externa não está configurada.',
      rationale: 'O provider não possui uma chave API configurada.',
      confidence: 0,
      confidenceSource: 'UNAVAILABLE',
      provider: 'openai',
    });

    await expect(
      service.analyze('org-1', input),
    ).resolves.toMatchObject({
      status: 'UNAVAILABLE',
      provider: 'openai',
    });

    expect(billingService.getEntitlements).not.toHaveBeenCalled();
    expect(usageService.reserveAiRequest).not.toHaveBeenCalled();
    expect(provider.analyze).toHaveBeenCalledWith(input);
  });

  it('does not call the provider when the monthly AI quota is exhausted', async () => {
    usageService.reserveAiRequest.mockRejectedValue(
      new UsageLimitExceededException('aiRequestsPerMonth'),
    );

    await expect(
      service.analyze('org-1', input),
    ).rejects.toBeInstanceOf(UsageLimitExceededException);

    expect(billingService.getEntitlements).toHaveBeenCalledWith('org-1');
    expect(usageService.reserveAiRequest).toHaveBeenCalledWith(
      'org-1',
      1000,
    );
    expect(provider.analyze).not.toHaveBeenCalled();
  });

  it('uses an unlimited entitlement when no AI request limit is configured', async () => {
    billingService.getEntitlements.mockResolvedValue({
      plan: {
        id: 'plan-enterprise',
        code: 'ENTERPRISE',
        name: 'Enterprise',
        monthlyPriceCents: 59900,
        currency: 'EUR',
      },
      limits: {},
      features: {
        intelligence: true,
      },
    });

    await expect(
      service.analyze('org-1', input),
    ).resolves.toMatchObject({
      status: 'GENERATED',
      provider: 'openai',
    });

    expect(usageService.reserveAiRequest).toHaveBeenCalledWith(
      'org-1',
      Infinity,
    );
    expect(provider.analyze).toHaveBeenCalledWith(input);
  });
});
