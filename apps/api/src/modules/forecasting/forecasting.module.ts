import { Module } from '@nestjs/common';

import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';

@Module({
  providers: [ForecastingService],
  controllers: [ForecastingController]
})
export class ForecastingModule {}
