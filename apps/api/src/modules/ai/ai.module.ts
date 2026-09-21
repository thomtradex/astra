import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { IntelligenceAiContextBuilder } from './context/intelligence-ai-context.builder';

@Module({
  providers: [AiService, IntelligenceAiContextBuilder],
  controllers: [AiController],
  exports: [AiService, IntelligenceAiContextBuilder],
})
export class AiModule {}
