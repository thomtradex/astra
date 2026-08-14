import { Module } from '@nestjs/common';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';
import { ForecastingEngine } from './engines/forecasting.engine';

@Module({
  controllers: [ForecastingController],
  providers: [ForecastingService, ForecastingEngine],
})
export class ForecastingModule {}
