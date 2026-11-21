import { StripeWorkerRunner } from './stripe-worker-runner';

describe('StripeWorkerRunner', () => {
  const worker = {
    processBatch: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();

    worker.processBatch.mockResolvedValue({
      discovered: 0,
      completed: 0,
      incomplete: 0,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('processes batches sequentially without overlap', async () => {
    let finishBatch:
      | ((result: {
          discovered: number;
          completed: number;
          incomplete: number;
        }) => void)
      | undefined;

    worker.processBatch.mockImplementationOnce(
      () => new Promise((resolve) => {
        finishBatch = resolve;
      }),
    );

    const runner = new StripeWorkerRunner(worker as never, 5000);
    const running = runner.run();

    expect(worker.processBatch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(20_000);

    expect(worker.processBatch).toHaveBeenCalledTimes(1);

    finishBatch?.({
      discovered: 1,
      completed: 1,
      incomplete: 0,
    });

    await Promise.resolve();
    await Promise.resolve();

    runner.stop();
    await running;

    expect(worker.processBatch).toHaveBeenCalledTimes(1);
  });

  it('recovers after a temporary batch failure', async () => {
    worker.processBatch
      .mockRejectedValueOnce(new Error('Temporary database failure'))
      .mockResolvedValue({
        discovered: 0,
        completed: 0,
        incomplete: 0,
      });

    const runner = new StripeWorkerRunner(worker as never, 5000);
    const running = runner.run();

    await Promise.resolve();
    await Promise.resolve();

    await jest.advanceTimersByTimeAsync(5000);

    expect(worker.processBatch).toHaveBeenCalledTimes(2);

    runner.stop();
    await running;
  });

  it('stops immediately while waiting between batches', async () => {
    const runner = new StripeWorkerRunner(worker as never, 5000);
    const running = runner.run();

    await Promise.resolve();
    await Promise.resolve();

    expect(worker.processBatch).toHaveBeenCalledTimes(1);

    runner.stop();

    await expect(running).resolves.toBeUndefined();

    await jest.advanceTimersByTimeAsync(20_000);

    expect(worker.processBatch).toHaveBeenCalledTimes(1);
  });

  it('waits for an active batch before shutting down', async () => {
    let finishBatch:
      | ((result: {
          discovered: number;
          completed: number;
          incomplete: number;
        }) => void)
      | undefined;

    worker.processBatch.mockImplementationOnce(
      () => new Promise((resolve) => {
        finishBatch = resolve;
      }),
    );

    const runner = new StripeWorkerRunner(worker as never, 5000);
    const running = runner.run();

    let finished = false;

    void running.then(() => {
      finished = true;
    });

    runner.stop();

    await Promise.resolve();

    expect(finished).toBe(false);

    finishBatch?.({
      discovered: 1,
      completed: 1,
      incomplete: 0,
    });

    await running;

    expect(finished).toBe(true);
    expect(worker.processBatch).toHaveBeenCalledTimes(1);
  });
});
