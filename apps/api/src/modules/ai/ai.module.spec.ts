import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AiModule } from './ai.module';
import { AI_PROVIDER, AiService } from './ai.service';
import type { AIProvider } from './providers/ai.provider';
import { DeterministicAiProvider } from './providers/deterministic-ai.provider';
import { OpenAiAiProvider } from './providers/openai-ai.provider';

describe('AiModule', () => {
  async function createModule(
    providerName?: string,
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              ai: {
                provider: providerName,
                openaiApiKey: undefined,
                openaiModel: 'gpt-5-mini',
                openaiTimeoutMs: 10000,
              },
            }),
          ],
        }),
        AiModule,
      ],
    }).compile();
  }

  it('should wire AI_PROVIDER to DeterministicAiProvider by default', async () => {
    const module = await createModule();

    const provider = module.get<AIProvider>(AI_PROVIDER);
    const deterministicProvider =
      module.get(DeterministicAiProvider);

    expect(provider).toBe(deterministicProvider);
  });

  it('should wire AI_PROVIDER to OpenAiAiProvider when configured', async () => {
    const module = await createModule('openai');

    const provider = module.get<AIProvider>(AI_PROVIDER);
    const openAiProvider = module.get(OpenAiAiProvider);

    expect(provider).toBe(openAiProvider);
  });

  it('should fall back to DeterministicAiProvider for an unknown provider', async () => {
    const module = await createModule('unknown-provider');

    const provider = module.get<AIProvider>(AI_PROVIDER);
    const deterministicProvider =
      module.get(DeterministicAiProvider);

    expect(provider).toBe(deterministicProvider);
  });

  it('should expose both concrete providers', async () => {
    const module = await createModule();

    expect(module.get(DeterministicAiProvider)).toBeDefined();
    expect(module.get(OpenAiAiProvider)).toBeDefined();
  });

  it('should expose AiService', async () => {
    const module = await createModule();

    expect(module.get(AiService)).toBeDefined();
  });

  it('should expose ConfigService', async () => {
    const module = await createModule();

    expect(module.get(ConfigService)).toBeDefined();
  });
});
