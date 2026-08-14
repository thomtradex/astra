import { Test, TestingModule } from '@nestjs/testing';

import { ForecastingEngine } from './engines/forecasting.engine';
import { ForecastingService } from './forecasting.service';

describe('ForecastingService', () => {
  let service: ForecastingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForecastingService, ForecastingEngine],
    }).compile();

    service = module.get<ForecastingService>(ForecastingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
