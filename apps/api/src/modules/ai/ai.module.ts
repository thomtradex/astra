import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AiController } from './ai.controller';
import { AiService, AI_PROVIDER } from './ai.service';
import { IntelligenceAiContextBuilder } from './context/intelligence-ai-context.builder';
import type { AIProvider } from './providers/ai.provider';
import { DeterministicAiProvider } from './providers/deterministic-ai.provider';
import { OpenAiAiProvider } from './providers/openai-ai.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    IntelligenceAiContextBuilder,
    DeterministicAiProvider,
    OpenAiAiProvider,
    {
      provide: AI_PROVIDER,
      inject: [
        ConfigService,
        DeterministicAiProvider,
        OpenAiAiProvider,
      ],
      useFactory: (
        configService: ConfigService,
        deterministicProvider: DeterministicAiProvider,
        openAiProvider: OpenAiAiProvider,
      ): AIProvider => {
        const provider = configService.get<string>('ai.provider');

        if (provider === 'openai') {
          return openAiProvider;
        }

        return deterministicProvider;
      },
    },
  ],
  controllers: [AiController],
  exports: [AiService, IntelligenceAiContextBuilder],
})
export class AiModule {}
