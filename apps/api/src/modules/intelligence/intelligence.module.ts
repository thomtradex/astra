import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { ProjectsModule } from '../projects/projects.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';

import { CooActionExecutorService } from './coo-action.executor';
import { DailyBriefingService } from './daily-briefing.service';
import { CooDecisionEngine } from './engines/intelligence.engine';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [IntelligenceController],
  imports: [AiModule, MaintenanceModule, WorkOrdersModule, ProjectsModule],
  providers: [
    IntelligenceService,
    CooDecisionEngine,
    CooActionExecutorService,
    DailyBriefingService,
  ],
  exports: [CooActionExecutorService],
})
export class IntelligenceModule {}
