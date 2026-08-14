import { Injectable } from '@nestjs/common';
import { AIProvider } from './providers/ai.provider';

@Injectable()
export class AiService implements AIProvider {
  async analyze(input: string): Promise<string> {
    return `AI analysis generated for: ${input}`;
  }
}
