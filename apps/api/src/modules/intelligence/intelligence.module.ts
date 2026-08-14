import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceEngine } from './engines/intelligence.engine';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, IntelligenceEngine],
})
export class IntelligenceModule {}
