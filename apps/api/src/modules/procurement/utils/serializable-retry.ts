import { Prisma } from '@astra/database';

import { PrismaService } from '../../../prisma/prisma.service';

export async function withSerializableRetry<T>(
  prisma: PrismaService,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const isSerializationConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';

      if (!isSerializationConflict || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 10 * 2 ** (attempt - 1)),
      );
    }
  }

  throw new Error('Serializable transaction retry exhausted');
}
