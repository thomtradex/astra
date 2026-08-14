import { Module } from '@nestjs/common';

import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  providers: [IntelligenceService],
  controllers: [IntelligenceController]
})
export class IntelligenceModule {}
