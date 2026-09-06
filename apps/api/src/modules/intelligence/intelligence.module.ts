import { Module } from '@nestjs/common';

import { WorkOrdersModule } from '../work-orders/work-orders.module';

import { CooActionExecutorService } from './coo-action.executor';

import { CooDecisionEngine } from './engines/intelligence.engine';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [IntelligenceController],
  imports: [WorkOrdersModule],
  providers: [IntelligenceService, CooDecisionEngine, CooActionExecutorService],
  exports: [CooActionExecutorService],
})
export class IntelligenceModule {}
