
import { createHash, randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../../src/modules/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from '../helpers/test-app';

const enabled =
  process.env.ASTRA_REFRESH_TRANSACTION_INTEGRATION === '1';

const describeIntegration = enabled ? describe : describe.skip;

describeIntegration('Auth refresh transaction — isolated PostgreSQL', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;
  let jwt: JwtService;

  const suffix = randomUUID().replace(/-/g, '');
  const slug = 'astra-refresh-tx-' + suffix;
  const email = 'refresh-tx-' + suffix + '@example.test';

  let organizationId: string | undefined;
  let userId: string | undefined;

  const context = {
    ipAddress: '127.0.0.1',
    userAgent: 'astra-isolated-refresh-test',
  };

  function hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  async function assertDatabaseIdentity() {
    const identity = await prisma.$queryRaw<
      Array<{ database_name: string; database_user: string }>
    >`
      SELECT
        current_database() AS database_name,
        current_user AS database_user
    `;

    expect(identity).toHaveLength(1);
    expect(identity[0]).toEqual({
      database_name: 'astra_auth_cert',
      database_user: 'astra_auth_cert',
    });
  }

  beforeAll(async () => {
    const url = new URL(process.env.DATABASE_URL || '');

    if (
      url.protocol !== 'postgresql:' &&
      url.protocol !== 'postgres:'
    ) {
      throw new Error('Unsafe database protocol');
    }

    if (
      url.hostname !== '127.0.0.1' ||
      url.port !== process.env.ASTRA_AUTH_CERT_PORT || !/^\d{4,5}$/.test(process.env.ASTRA_AUTH_CERT_PORT || '') ||
      url.pathname !== '/astra_auth_cert' ||
      decodeURIComponent(url.username) !== 'astra_auth_cert'
    ) {
      throw new Error('Unsafe integration database URL');
    }

    const testApp = await createTestApp();

    app = testApp.app;
    prisma = testApp.prisma;
    auth = app.get(AuthService);
    jwt = app.get(JwtService);

    await assertDatabaseIdentity();

    const organization = await prisma.organization.create({
      data: {
        name: 'Astra Refresh Transaction ' + suffix,
        slug,
      },
    });

    organizationId = organization.id;

    const user = await prisma.user.create({
      data: {
        email,
        username: 'refreshtx' + suffix,
        passwordHash: 'isolated-test-not-a-login',
        firstName: 'Astra',
        lastName: 'Refresh',
        organizationId,
      },
    });

    userId = user.id;
  });

  afterAll(async () => {
    try {
      if (!prisma) return;

      await assertDatabaseIdentity();

      const organization = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!organization) return;

      if (organizationId && organization.id !== organizationId) {
        throw new Error('Cleanup refused: organization mismatch');
      }

      const users = await prisma.user.findMany({
        where: { organizationId: organization.id },
        select: { id: true, email: true },
      });

      if (
        users.length !== 1 ||
        users[0]?.email !== email ||
        (userId && users[0].id !== userId)
      ) {
        throw new Error('Cleanup refused: unexpected users');
      }

      const isolatedUserId = users[0].id;

      await prisma.refreshToken.deleteMany({
        where: { userId: isolatedUserId },
      });

      await prisma.authSession.deleteMany({
        where: { userId: isolatedUserId },
      });

      await prisma.auditLog.deleteMany({
        where: { actorId: isolatedUserId },
      });

      await prisma.userRole.deleteMany({
        where: { userId: isolatedUserId },
      });

      await prisma.user.delete({
        where: { id: isolatedUserId },
      });

      await prisma.auditLog.deleteMany({
        where: { organizationId: organization.id },
      });

      await prisma.subscription.deleteMany({
        where: { organizationId: organization.id },
      });

      await prisma.organization.delete({
        where: { id: organization.id },
      });
    } finally {
      if (app) await app.close();
    }
  });

  it('rotates a token and rejects replay', async () => {
    const original = 'astra-original-' + suffix;

    const session = await prisma.authSession.create({
      data: {
        userId: userId!,
      },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hash(original),
        userId: userId!,
        sessionId: session.id,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    const tokens = await auth.refresh(original, context);

    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();

    const oldRecord = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(original) },
    });

    const newRecord = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(tokens.refreshToken) },
    });

    expect(oldRecord.revokedAt).not.toBeNull();
    expect(newRecord.revokedAt).toBeNull();
    expect(newRecord.userId).toBe(userId);

    await expect(
      auth.refresh(original, context),
    ).rejects.toThrow('Invalid refresh token');
  });

  it('rolls back revocation when JWT signing fails', async () => {
    const original = 'astra-rollback-' + suffix;

    const session = await prisma.authSession.create({
      data: {
        userId: userId!,
      },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hash(original),
        userId: userId!,
        sessionId: session.id,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    const spy = jest
      .spyOn(jwt, 'signAsync')
      .mockRejectedValueOnce(new Error('Simulated JWT signing failure'));

    try {
      await expect(
        auth.refresh(original, context),
      ).rejects.toThrow('Simulated JWT signing failure');
    } finally {
      spy.mockRestore();
    }

    const record = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(original) },
    });

    expect(record.revokedAt).toBeNull();

    const tokens = await auth.refresh(original, context);

    expect(tokens.refreshToken).toBeTruthy();

    const consumed = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(original) },
    });

    expect(consumed.revokedAt).not.toBeNull();
  });


  async function createConcurrencyFixture(token: string) {
    const session = await prisma.authSession.create({
      data: { userId: userId! },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hash(token),
        userId: userId!,
        sessionId: session.id,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });

    return session;
  }

  it('allows exactly one successful concurrent refresh', async () => {
    for (let i = 0; i < 12; i++) {
      const original = 'concurrent-refresh-' + suffix + '-' + i;
      const session = await createConcurrencyFixture(original);

      const results = await Promise.allSettled([
        auth.refresh(original, context),
        auth.refresh(original, context),
      ]);

      const successful = results.filter(
        (r): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof auth.refresh>>
        > => r.status === 'fulfilled',
      );

      expect(successful).toHaveLength(1);

      const active = await prisma.refreshToken.findMany({
        where: { sessionId: session.id, revokedAt: null },
      });

      expect(active).toHaveLength(1);
      expect(active[0].tokenHash).toBe(
        hash(successful[0].value.refreshToken),
      );

      await expect(
        auth.refresh(original, context),
      ).rejects.toThrow();
    }
  });

  it('revokes session during concurrent refresh and logout', async () => {
    for (let i = 0; i < 12; i++) {
      const original = 'concurrent-logout-' + suffix + '-' + i;
      const session = await createConcurrencyFixture(original);

      const results = await Promise.allSettled([
        auth.refresh(original, context),
        auth.logout(original, context),
      ]);

      expect(results[1].status).toBe('fulfilled');

      const stored = await prisma.authSession.findUniqueOrThrow({
        where: { id: session.id },
      });

      expect(stored.revokedAt).not.toBeNull();

      await expect(
        auth.refresh(original, context),
      ).rejects.toThrow();

      const refresh = results[0];

      if (refresh.status === 'fulfilled') {
        await expect(
          auth.refresh(refresh.value.refreshToken, context),
        ).rejects.toThrow();

        const payload = jwt.decode(refresh.value.accessToken);
        expect(payload).toBeTruthy();

        expect(
          await auth.validateAccessTokenPayload(
            payload as Parameters<
              typeof auth.validateAccessTokenPayload
            >[0],
          ),
        ).toBeNull();
      }
    }
  });

  it('invalidates an issued access token after logout', async () => {
    const original = 'concurrent-access-' + suffix;
    const session = await createConcurrencyFixture(original);
    const tokens = await auth.refresh(original, context);

    const payload = jwt.decode(tokens.accessToken);
    expect(payload).toBeTruthy();

    const typed = payload as Parameters<
      typeof auth.validateAccessTokenPayload
    >[0];

    expect(
      await auth.validateAccessTokenPayload(typed),
    ).not.toBeNull();

    await auth.logout(tokens.refreshToken, context);

    const stored = await prisma.authSession.findUniqueOrThrow({
      where: { id: session.id },
    });

    expect(stored.revokedAt).not.toBeNull();

    expect(
      await auth.validateAccessTokenPayload(typed),
    ).toBeNull();

    await expect(
      auth.refresh(tokens.refreshToken, context),
    ).rejects.toThrow();
  });

});
