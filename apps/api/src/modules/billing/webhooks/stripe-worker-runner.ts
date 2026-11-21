import { Logger } from '@nestjs/common';

import { StripeWebhookWorker } from './stripe-webhook-worker.service';

export class StripeWorkerRunner {
  private readonly logger = new Logger(StripeWorkerRunner.name);
  private stopping = false;
  private wake: (() => void) | null = null;

  constructor(
    private readonly worker: StripeWebhookWorker,
    private readonly intervalMs = 5000,
  ) {}

  stop(): void {
    this.stopping = true;
    this.wake?.();
  }

  private wait(): Promise<void> {
    if (this.stopping) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.wake = null;
        resolve();
      }, this.intervalMs);

      this.wake = () => {
        clearTimeout(timer);
        this.wake = null;
        resolve();
      };
    });
  }

  async run(): Promise<void> {
    while (!this.stopping) {
      try {
        const result = await this.worker.processBatch(25);

        if (result.discovered > 0) {
          this.logger.log(
            'Stripe batch: ' +
              result.completed + ' completed, ' +
              result.incomplete + ' incomplete',
          );
        }
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : String(error);

        this.logger.error('Stripe worker batch failed: ' + reason);
      }

      if (!this.stopping) {
        await this.wait();
      }
    }
  }
}
