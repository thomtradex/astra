import { Prisma } from '@astra/database';

import { PrismaService } from '../../../prisma/prisma.service';

import { withSerializableRetry } from './serializable-retry';

describe('withSerializableRetry', () => {
  const transaction = jest.fn();
  const prisma = {
    $transaction: transaction,
  } as unknown as PrismaService;

  const transactionOptions = {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  };

  const createSerializationConflict = () =>
    new Prisma.PrismaClientKnownRequestError(
      'Serialization conflict',
      {
        code: 'P2034',
        clientVersion: 'test',
      },
    );

  beforeEach(() => {
    transaction.mockReset();
  });

  it('executes the transaction with serializable isolation', async () => {
    transaction.mockResolvedValue('success');

    const operation = jest.fn().mockResolvedValue('result');

    await expect(
      withSerializableRetry(prisma, operation),
    ).resolves.toBe('success');

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(
      operation,
      transactionOptions,
    );
  });

  it('retries a P2034 conflict and returns the subsequent result', async () => {
    const conflict = createSerializationConflict();

    transaction
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce('recovered');

    const operation = jest.fn().mockResolvedValue('result');

    await expect(
      withSerializableRetry(prisma, operation),
    ).resolves.toBe('recovered');

    expect(transaction).toHaveBeenCalledTimes(2);
    expect(transaction).toHaveBeenNthCalledWith(
      1,
      operation,
      transactionOptions,
    );
    expect(transaction).toHaveBeenNthCalledWith(
      2,
      operation,
      transactionOptions,
    );
  });

  it('stops after three attempts when serialization conflicts persist', async () => {
    const conflict = createSerializationConflict();

    transaction.mockRejectedValue(conflict);

    await expect(
      withSerializableRetry(prisma, jest.fn().mockResolvedValue('result')),
    ).rejects.toBe(conflict);

    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry errors that are not serialization conflicts', async () => {
    const error = new Error('Unexpected database failure');

    transaction.mockRejectedValue(error);

    await expect(
      withSerializableRetry(prisma, jest.fn().mockResolvedValue('result')),
    ).rejects.toBe(error);

    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
