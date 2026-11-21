import { createHash, randomBytes } from 'crypto';

import { AuditAction, Prisma } from '@astra/database';
import { AuthTokens, JwtAccessPayload, Permission, SystemRole, SYSTEM_ROLES } from '@astra/shared';
import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

import { lockActiveSession, revokeSession } from './auth-session-concurrency';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext): Promise<AuthTokens> {
    const companyName = dto.companyName.trim();
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();
    const email = dto.email.trim().toLowerCase();

    if (!companyName || !firstName || !lastName || !email) {
      throw new ForbiddenException('Registration data is invalid');
    }

    const usernameBase = (
      dto.username?.trim().toLowerCase() ||
      `${firstName}.${lastName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9._-]/g, '')
    ).slice(0, 48);

    if (!usernameBase) {
      throw new ForbiddenException('Unable to create username');
    }

    const slugBase =
      companyName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'empresa';

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const existingEmail = await tx.user.findFirst({
        where: { email },
        select: { id: true },
      });

      if (existingEmail) {
        throw new ForbiddenException('Este email já está registado.');
      }

      let slug = slugBase;
      let suffix = 2;

      while (await tx.organization.findUnique({ where: { slug }, select: { id: true } })) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }

      let username = usernameBase;
      let usernameSuffix = 2;

      while (
        await tx.user.findFirst({
          where: { username },
          select: { id: true },
        })
      ) {
        username = `${usernameBase}-${usernameSuffix}`;
        usernameSuffix += 1;
      }

      const adminRole = await tx.role.findUnique({
        where: { name: SYSTEM_ROLES.ADMIN },
        select: { id: true },
      });

      if (!adminRole) {
        throw new ForbiddenException('Admin role is not configured.');
      }

      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
        },
      });

      const freePlan = await tx.billingPlan.findUnique({
        where: { code: 'FREE' },
      });

      if (!freePlan || !freePlan.isActive || freePlan.monthlyPriceCents !== 0) {
        throw new ConflictException('FREE billing plan is not available');
      }

      const now = new Date();

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: new Date('2099-12-31T23:59:59.999Z'),
          cancelAtPeriodEnd: false,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          firstName,
          lastName,
          organizationId: organization.id,
          isActive: true,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      const completeUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
          organization: true,
        },
      });

      return completeUser;
    });

    const authenticatedUser = this.mapToAuthenticatedUser(result);
    const tokens = await this.prisma.$transaction((tx) =>
      this.issueTokens(authenticatedUser, context, tx),
    );

    await this.auditService.log({
      organizationId: result.organizationId,
      actorId: result.id,
      action: AuditAction.CREATE,
      resource: 'auth',
      resourceId: result.id,
      method: 'POST',
      path: '/auth/register',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      statusCode: 201,
      metadata: {
        email: result.email,
        organizationId: result.organizationId,
      },
    });

    return tokens;
  }

  async login(dto: LoginDto, context: RequestContext): Promise<AuthTokens> {
    const identifier = (
      dto.identifier ??
      dto.username ??
      dto.email ??
      ''
    ).trim().toLowerCase();

    if (!identifier) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.resolveUserForLogin(
      identifier,
      dto.organizationSlug,
    );

    if (!user || !user.isActive || !user.organization.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.LOGIN,
        resource: 'auth',
        method: 'POST',
        path: '/auth/login',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        statusCode: 401,
        metadata: { identifier, success: false },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authenticatedUser = this.mapToAuthenticatedUser(user);
    const tokens = await this.prisma.$transaction((tx) =>
      this.issueTokens(authenticatedUser, context, tx),
    );

    await this.auditService.log({
      organizationId: user.organizationId,
      actorId: user.id,
      action: AuditAction.LOGIN,
      resource: 'auth',
      resourceId: user.id,
      method: 'POST',
      path: '/auth/login',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      statusCode: 200,
      metadata: { email: user.email, success: true },
    });

    return tokens;
  }

  async refresh(refreshToken: string, context: RequestContext): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
            organization: true,
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date() ||
      !storedToken.user.isActive ||
      !storedToken.user.organization.is_active
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const authenticatedUser = this.mapToAuthenticatedUser(storedToken.user);

    const tokens = await this.prisma.$transaction(async (tx) => {
      if (!storedToken.sessionId) {
        throw new UnauthorizedException('Legacy refresh token requires reauthentication');
      }

      await lockActiveSession(tx, storedToken.sessionId);

      const now = new Date();

      const consumed = await tx.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      if (consumed.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(authenticatedUser, context, tx, storedToken.sessionId);
    });

    await this.auditService.log({
      organizationId: storedToken.user.organizationId,
      actorId: storedToken.user.id,
      action: AuditAction.REFRESH,
      resource: 'auth',
      resourceId: storedToken.user.id,
      method: 'POST',
      path: '/auth/refresh',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      statusCode: 200,
    });

    return tokens;
  }

  async logout(refreshToken: string, context: RequestContext): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) return;

    if (!storedToken.sessionId) {
      await this.prisma.refreshToken.updateMany({
        where: { id: storedToken.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }

    const revoked = await this.prisma.$transaction(async (tx) => {
      return revokeSession(tx, storedToken.sessionId!);
    });

    if (!revoked) return;

    await this.auditService.log({
      organizationId: storedToken.user.organizationId,
      actorId: storedToken.user.id,
      action: AuditAction.LOGOUT,
      resource: 'auth',
      resourceId: storedToken.user.id,
      method: 'POST',
      path: '/auth/logout',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      statusCode: 200,
    });
  }

  async getProfile(
    userId: string,
  ): Promise<AuthenticatedUser & { firstName: string; lastName: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('User not found or inactive');
    }

    const authenticated = this.mapToAuthenticatedUser(user);

    return {
      ...authenticated,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async validateAccessTokenPayload(payload: JwtAccessPayload): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!user || !user.isActive || !user.organization.is_active) {
      return null;
    }

    if (!payload.sessionId) {
      return null;
    }

    {
      const session = await this.prisma.authSession.findUnique({
        where: { id: payload.sessionId },
        select: { userId: true, revokedAt: true },
      });

      if (
        !session ||
        session.userId !== user.id ||
        session.revokedAt !== null
      ) {
        return null;
      }
    }

    return this.mapToAuthenticatedUser(user);
  }

  private async issueTokens(
    user: AuthenticatedUser,
    context: RequestContext,
    tokenStore: Prisma.TransactionClient | PrismaService = this.prisma,
    existingSessionId?: string,
  ): Promise<AuthTokens> {
    const sessionId = existingSessionId ?? (
      await tokenStore.authSession.create({
        data: { userId: user.id },
        select: { id: true },
      })
    ).id;

    const payload: JwtAccessPayload = {
      sessionId,
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    ) as import('ms').StringValue;
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const refreshExpiresMs = this.parseDurationToMs(refreshExpiresIn);

    await tokenStore.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiresMs),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDurationToSeconds(accessExpiresIn),
    };
  }

  private async resolveUserForLogin(
    identifier: string,
    organizationSlug?: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
      include: {
        organization: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (organizationSlug) {
      const filtered = users.filter(
        (user) => user.organization.slug === organizationSlug,
      );

      if (filtered.length !== 1) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return filtered[0];
    }

    if (users.length === 1) {
      return users[0];
    }

    if (users.length > 1) {
      throw new UnauthorizedException(
        'Multiple accounts found. Specify the organization slug.',
      );
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private mapToAuthenticatedUser(user: {
    id: string;
    email: string;
    username?: string | null;
    organizationId: string;
    roles: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { name: string } }>;
      };
    }>;
  }): AuthenticatedUser {
    const roles = [...new Set(user.roles.map((ur) => ur.role.name))] as SystemRole[];
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))),
    ] as Permission[];

    return {
      id: user.id,
      email: user.email,
      username: user.username ?? undefined,
      organizationId: user.organizationId,
      roles,
      permissions,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDurationToMs(duration: string): number {
    return this.parseDurationToSeconds(duration) * 1000;
  }

  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

    const value = parseInt(match[1] ?? '15', 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}
