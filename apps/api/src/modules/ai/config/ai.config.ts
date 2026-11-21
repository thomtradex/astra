import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER ?? 'deterministic',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
  openaiTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS ?? 10000),
}));
