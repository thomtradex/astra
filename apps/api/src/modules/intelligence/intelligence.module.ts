import { Module } from '@nestjs/common';

import { CooDecisionEngine } from './engines/intelligence.engine';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, CooDecisionEngine],
})
export class IntelligenceModule {}
