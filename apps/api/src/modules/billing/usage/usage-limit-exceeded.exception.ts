import { BadRequestException } from '@nestjs/common';

export class UsageLimitExceededException extends BadRequestException {
  constructor(metric: string) {
    super(
      `You have reached your ${metric} limit for the current plan.`,
    );
  }
}
