import { Injectable } from '@nestjs/common';
import { Prisma } from '@astra/database';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';

export interface StripeSubscriptionSyncClaim {
  subscriptionId: string;
  token: string;
  generation: bigint;
}

@Injectable()
export class StripeSubscriptionSyncLockService {
  private readonly leaseMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}


  async acquire(
    subscriptionId: string,
  ): Promise<StripeSubscriptionSyncClaim | null> {
    if (!subscriptionId) {
      throw new Error('Stripe subscription ID is required');
    }

    const token = randomUUID();

    await this.prisma.stripeSubscriptionSyncLock.createMany({
      data: [{ subscriptionId }],
      skipDuplicates: true,
    });

    const rows = await this.prisma.$queryRaw<
      Array<{ generation: bigint }>
    >`
      UPDATE "stripe_subscription_sync_locks"
      SET
        "claim_token" = ${token},
        "generation" = "generation" + 1,
        "expires_at" =
          clock_timestamp() + (${this.leaseMs}::integer * interval '1 millisecond'),
        "updated_at" = clock_timestamp()
      WHERE
        "subscription_id" = ${subscriptionId}
        AND (
          "claim_token" IS NULL
          OR "expires_at" <= clock_timestamp()
        )
      RETURNING "generation"
    `;

    if (rows.length === 0) {
      return null;
    }

    if (rows.length !== 1) {
      throw new Error('Unexpected Stripe synchronization claim count');
    }

    const acquired = rows[0];

    if (!acquired) {
      throw new Error('Stripe synchronization claim result is missing');
    }

    return {
      subscriptionId,
      token,
      generation: acquired.generation,
    };
  }

  async renew(claim: StripeSubscriptionSyncClaim): Promise<boolean> {
    const updated = await this.prisma.$executeRaw`
      UPDATE "stripe_subscription_sync_locks"
      SET
        "expires_at" =
          clock_timestamp() + (${this.leaseMs}::integer * interval '1 millisecond'),
        "updated_at" = clock_timestamp()
      WHERE
        "subscription_id" = ${claim.subscriptionId}
        AND "claim_token" = ${claim.token}
        AND "generation" = ${claim.generation}
        AND "expires_at" > clock_timestamp()
    `;

    return updated === 1;
  }

  async assertOwnershipInTransaction(
    tx: Prisma.TransactionClient,
    claim: StripeSubscriptionSyncClaim,
  ): Promise<void> {
    const updated = await tx.$executeRaw`
      UPDATE "stripe_subscription_sync_locks"
      SET "updated_at" = clock_timestamp()
      WHERE
        "subscription_id" = ${claim.subscriptionId}
        AND "claim_token" = ${claim.token}
        AND "generation" = ${claim.generation}
        AND "expires_at" > clock_timestamp()
    `;

    if (updated !== 1) {
      throw new Error(
        'Stripe subscription synchronization claim is no longer valid',
      );
    }
  }

  async release(claim: StripeSubscriptionSyncClaim): Promise<boolean> {
    const result = await this.prisma.stripeSubscriptionSyncLock.updateMany({
      where: {
        subscriptionId: claim.subscriptionId,
        claimToken: claim.token,
        generation: claim.generation,
      },
      data: {
        claimToken: null,
        expiresAt: null,
      },
    });

    return result.count === 1;
  }
}
