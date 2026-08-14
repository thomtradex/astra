import { Module } from '@nestjs/common';

import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  providers: [ScoringService],
  controllers: [ScoringController]
})
export class ScoringModule {}
