import { Injectable } from '@nestjs/common';

import { AIProvider } from './providers/ai.provider';

@Injectable()
export class AiService implements AIProvider {
  analyze(input: string): Promise<string> {
    return Promise.resolve(`AI analysis generated for: ${input}`);
  }
}
