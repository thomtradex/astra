import { Injectable } from '@nestjs/common';

import { ForecastingEngine } from './engines/forecasting.engine';

@Injectable()
export class ForecastingService {
  constructor(private readonly engine: ForecastingEngine) {}

  predict(history: number[]) {
    return this.engine.predict({
      history,
    });
  }
}
