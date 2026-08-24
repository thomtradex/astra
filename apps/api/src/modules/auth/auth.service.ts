import { createHash, randomBytes } from 'crypto';

import { AuditAction } from '@astra/database';
import { AuthTokens, JwtAccessPayload, Permission, SystemRole } from '@astra/shared';
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

import { LoginDto } from './dto/auth.dto';
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

  async login(dto: LoginDto, context: RequestContext): Promise<AuthTokens> {
    const email = dto.email.toLowerCase();
    const user = await this.resolveUserForLogin(email, dto.organizationSlug);

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
        metadata: { email: dto.email, success: false },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authenticatedUser = this.mapToAuthenticatedUser(user);
    const tokens = await this.issueTokens(authenticatedUser, context);

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

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const authenticatedUser = this.mapToAuthenticatedUser(storedToken.user);
    const tokens = await this.issueTokens(authenticatedUser, context);

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

  async logout(
    refreshToken: string,
    context: RequestContext,
  ): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      return;
    }

    if (storedToken.revokedAt) {
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      return;
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

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

    return this.mapToAuthenticatedUser(user);
  }

  private async issueTokens(user: AuthenticatedUser, context: RequestContext): Promise<AuthTokens> {
    const payload: JwtAccessPayload = {
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

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
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

  private async resolveUserForLogin(email: string, organizationSlug?: string) {
    const include = {
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
    } as const;

    if (organizationSlug) {
      return this.prisma.user.findFirst({
        where: {
          email,
          organization: { slug: organizationSlug.toLowerCase() },
        },
        include,
      });
    }

    const matches = await this.prisma.user.findMany({
      where: { email },
      include,
      take: 2,
    });

    if (matches.length === 0) {
      return null;
    }

    if (matches.length > 1) {
      throw new UnauthorizedException(
        'Multiple accounts found for this email. Specify the organization slug.',
      );
    }

    return matches[0] ?? null;
  }

  private mapToAuthenticatedUser(user: {
    id: string;
    email: string;
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
