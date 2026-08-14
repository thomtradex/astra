import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { ScoringEngine } from './engines/scoring.engine';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService, ScoringEngine],
})
export class ScoringModule {}
