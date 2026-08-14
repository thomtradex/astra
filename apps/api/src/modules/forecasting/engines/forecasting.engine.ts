import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastingEngine {
  predict(input: {
    history: number[];
  }) {
    const average =
      input.history.reduce((a, b) => a + b, 0) /
      input.history.length;

    return {
      forecast: Math.round(average),
      confidence: 0.85,
    };
  }
}
