import { StripeWorkerRunner } from './stripe-worker-runner';

describe('Stripe worker shutdown', () => {
  const worker = {
    processBatch: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('stops after a simulated SIGTERM while idle', async () => {
    worker.processBatch.mockResolvedValue({
      discovered: 0,
      completed: 0,
      incomplete: 0,
    });

    const runner = new StripeWorkerRunner(worker as never, 5000);

    const handler = () => runner.stop();
    process.once('SIGTERM', handler);

    try {
      const running = runner.run();

      await Promise.resolve();
      await Promise.resolve();

      expect(worker.processBatch).toHaveBeenCalledTimes(1);

      process.emit('SIGTERM');

      await expect(running).resolves.toBeUndefined();

      expect(worker.processBatch).toHaveBeenCalledTimes(1);
    } finally {
      process.removeListener('SIGTERM', handler);
    }
  });

  it('waits for an active batch after simulated SIGTERM', async () => {
    let finishBatch:
      | ((result: {
          discovered: number;
          completed: number;
          incomplete: number;
        }) => void)
      | undefined;

    worker.processBatch.mockImplementation(
      () => new Promise((resolve) => {
        finishBatch = resolve;
      }),
    );

    const runner = new StripeWorkerRunner(worker as never, 5000);

    const handler = () => runner.stop();
    process.once('SIGTERM', handler);

    try {
      const running = runner.run();

      let stopped = false;

      void running.then(() => {
        stopped = true;
      });

      process.emit('SIGTERM');

      await Promise.resolve();

      expect(stopped).toBe(false);
      expect(worker.processBatch).toHaveBeenCalledTimes(1);

      finishBatch?.({
        discovered: 1,
        completed: 1,
        incomplete: 0,
      });

      await running;

      expect(stopped).toBe(true);
      expect(worker.processBatch).toHaveBeenCalledTimes(1);
    } finally {
      process.removeListener('SIGTERM', handler);
    }
  });
});
