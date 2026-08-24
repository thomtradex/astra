import { Module } from '@nestjs/common';

import { ForecastingEngine } from './engines/forecasting.engine';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';

@Module({
  controllers: [ForecastingController],
  providers: [ForecastingService, ForecastingEngine],
})
export class ForecastingModule {}
