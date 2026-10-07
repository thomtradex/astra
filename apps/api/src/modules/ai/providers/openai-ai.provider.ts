import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import type { AIAnalysis, AIAnalysisInput } from '../ai.types';

import type { AIProvider } from './ai.provider';
import type { LlmAnalysisOutput } from './llm-analysis-output';
import {
  LlmAnalysisOutputValidationError,
  validateLlmAnalysisOutput,
} from './llm-analysis-output.validator';

const LLM_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: {
      type: 'string',
      description:
        'Resumo operacional curto e objetivo do sinal apresentado.',
    },
    rationale: {
      type: 'string',
      description:
        'Justificação baseada exclusivamente nos factos e contexto operacional fornecidos.',
    },
    recommendedRecommendationId: {
      type: ['string', 'null'],
      description:
        'ID de uma recommendation existente no contexto ou null quando nenhuma deve ser recomendada.',
    },
    confidence: {
      type: 'number',
      description:
        'Confiança da análise entre 0 e 1. Não representa autorização para executar uma ação.',
    },
  },
  required: [
    'summary',
    'rationale',
    'recommendedRecommendationId',
    'confidence',
  ],
} as const;

@Injectable()
export class OpenAiAiProvider implements AIProvider {
  private readonly client: OpenAI | undefined;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');

    this.model =
      this.configService.get<string>('ai.openaiModel') ?? 'gpt-5-mini';

    const timeout =
      this.configService.get<number>('ai.openaiTimeoutMs') ?? 10000;

    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        timeout,
      });
    }
  }

  isBillable(): boolean {
    return this.client !== undefined;
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysis> {
    if (!this.client) {
      return this.unavailable(
        'A análise AI externa não está configurada.',
        'O provider OpenAI não possui uma chave API configurada. A análise operacional determinística permanece disponível.',
      );
    }

    try {
      const response = await this.client.responses.create({
        model: this.model,
        instructions: this.buildInstructions(),
        input: this.buildInput(input),
        text: {
          format: {
            type: 'json_schema',
            name: 'astra_ai_analysis',
            strict: true,
            schema: LLM_ANALYSIS_SCHEMA,
          },
        },
      });

      const rawOutput = response.output_text;

      if (!rawOutput.trim()) {
        return this.unavailable(
          'A análise AI externa não produziu conteúdo.',
          'O provider OpenAI respondeu sem conteúdo estruturado. A análise operacional determinística permanece disponível.',
        );
      }

      const parsed: unknown = JSON.parse(rawOutput);

      validateLlmAnalysisOutput(
        parsed,
        input.decisionContext,
        input.signalSource,
      );

      return this.toAnalysis(parsed, input);
    } catch (error) {
      if (error instanceof LlmAnalysisOutputValidationError) {
        return this.unavailable(
          'A análise AI externa produziu uma resposta inválida.',
          `A resposta estruturada do provider foi rejeitada pela validação Astra: ${error.message}`,
        );
      }

      return this.unavailable(
        'A análise AI externa está temporariamente indisponível.',
        'Não foi possível obter uma análise estruturada do provider OpenAI. A análise operacional determinística permanece disponível.',
      );
    }
  }

  private toAnalysis(
    output: LlmAnalysisOutput,
    input: AIAnalysisInput,
  ): AIAnalysis {
    return {
      status: 'GENERATED',
      summary: output.summary,
      rationale: output.rationale,
      ...(output.recommendedRecommendationId
        ? {
            recommendedRecommendationId:
              output.recommendedRecommendationId,
          }
        : {}),
      confidence: Math.min(
        output.confidence,
        input.decisionContext.confidence,
      ),
      confidenceSource: 'LLM',
      provider: 'openai',
    };
  }

  private buildInstructions(): string {
    return [
      'És o analista AI operacional da plataforma Astra.',
      'Analisa exclusivamente os dados fornecidos no contexto.',
      'Não inventes factos, IDs, recursos, estados ou recomendações.',
      'Não cries novas recommendations.',
      'Se recomendares uma ação, usa exclusivamente o ID de uma recommendation existente no contexto.',
      'Se nenhuma recommendation existente for apropriada, usa null.',
      'A confidence representa a confiança na análise, não autorização para executar ações.',
      'Não executas nenhuma ação e não alteras dados.',
      'Produz apenas o objeto estruturado definido pelo schema.',
    ].join(' ');
  }

  private buildInput(input: AIAnalysisInput): string {
    return JSON.stringify({
      signal: {
        id: input.signalId,
        type: input.signalType,
        severity: input.severity,
        title: input.title,
        explanation: input.explanation,
        urgency: input.urgency,
        impact: input.impact,
        recommendedAction: input.recommendedAction,
      },
      decisionContext: input.decisionContext,
    });
  }

  private unavailable(summary: string, rationale: string): AIAnalysis {
    return {
      status: 'UNAVAILABLE',
      summary,
      rationale,
      confidence: 0,
      confidenceSource: 'UNAVAILABLE',
      provider: 'openai',
    };
  }
}
