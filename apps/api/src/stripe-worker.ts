import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { StripeWebhookWorker } from './modules/billing/webhooks/stripe-webhook-worker.service';
import { StripeWorkerModule } from './modules/billing/webhooks/stripe-worker.module';
import { StripeWorkerRunner } from './modules/billing/webhooks/stripe-worker-runner';

async function bootstrap(): Promise<void> {
  if (process.env.STRIPE_WORKER_ENABLED !== 'true') {
    throw new Error(
      'Stripe worker disabled: STRIPE_WORKER_ENABLED must be true',
    );
  }

  const app = await NestFactory.createApplicationContext(
    StripeWorkerModule,
    { logger: ['error', 'warn', 'log'] },
  );

  const logger = new Logger('StripeWorkerBootstrap');
  const worker = app.get(StripeWebhookWorker);
  const runner = new StripeWorkerRunner(worker);

  let stopping = false;

  const shutdown = (): void => {
    if (stopping) return;
    stopping = true;
    logger.log('Stripe worker shutdown requested');
    runner.stop();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  try {
    logger.log('Stripe webhook worker started');
    await runner.run();
  } finally {
    process.removeListener('SIGTERM', shutdown);
    process.removeListener('SIGINT', shutdown);
    await app.close();
    logger.log('Stripe webhook worker stopped');
  }
}

void bootstrap().catch((error: unknown) => {
  const reason =
    error instanceof Error ? error.message : String(error);

  console.error('Stripe worker startup failed: ' + reason);
  process.exitCode = 1;
});
