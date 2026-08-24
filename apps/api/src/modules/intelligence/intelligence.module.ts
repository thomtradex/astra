import { Module } from '@nestjs/common';

import { IntelligenceEngine } from './engines/intelligence.engine';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, IntelligenceEngine],
})
export class IntelligenceModule {}
