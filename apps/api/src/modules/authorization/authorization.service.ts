import { AuditAction } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationPolicy,
} from './authorization.types';

@Injectable()
export class AuthorizationService {
  constructor(private readonly auditService: AuditService) {}

  async authorize(
    policy: AuthorizationPolicy,
    context: AuthorizationContext,
  ): Promise<AuthorizationDecision> {
    const decision = policy.evaluate(context);

    await this.auditService.log({
      organizationId: context.user.organizationId,
      actorId: context.user.id,
      action: decision.allowed ? AuditAction.READ : AuditAction.ACCESS_DENIED,
      resource: context.resource ?? 'authorization',
      resourceId: context.resourceId ?? null,
      metadata: {
        type: 'authorization_decision',
        policy: decision.policy,
        allowed: decision.allowed,
        reason: decision.reason,
        requiredPermissions: decision.requiredPermissions,
        userPermissions: context.user.permissions,
        ...(context.metadata ?? {}),
      },
    });

    return decision;
  }

  async can(
    policy: AuthorizationPolicy,
    context: AuthorizationContext,
  ): Promise<boolean> {
    const decision = await this.authorize(policy, context);

    return decision.allowed;
  }
}
