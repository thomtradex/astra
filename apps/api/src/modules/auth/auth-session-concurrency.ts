import { UnauthorizedException } from '@nestjs/common';
import type { Prisma } from '@astra/database';

type SessionTransaction = Prisma.TransactionClient;

export async function lockActiveSession(
  tx: SessionTransaction,
  sessionId: string,
): Promise<void> {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM auth_sessions
    WHERE id = ${sessionId}
      AND revoked_at IS NULL
    FOR UPDATE
  `;

  if (rows.length !== 1) {
    throw new UnauthorizedException('Session revoked or missing');
  }
}

export async function revokeSession(
  tx: SessionTransaction,
  sessionId: string,
): Promise<boolean> {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM auth_sessions
    WHERE id = ${sessionId}
    FOR UPDATE
  `;

  if (rows.length !== 1) return false;

  const result = await tx.authSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count === 1;
}
