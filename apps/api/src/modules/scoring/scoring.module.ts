import { Module } from '@nestjs/common';

import { ScoringEngine } from './engines/scoring.engine';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService, ScoringEngine],
})
export class ScoringModule {}
