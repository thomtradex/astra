import { AuditAction } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { AuthorizationService } from '../authorization/authorization.service';
import { CanManageWorkOrders } from '../authorization/policies/work-order.policies';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuditService } from '../audit/audit.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';

import {
  CooAction,
  CooActionExecutor,
  CooActionOutcome,
} from './coo-actions.types';

@Injectable()
export class CooActionExecutorService implements CooActionExecutor {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  async execute(
    user: AuthenticatedUser,
    action: CooAction,
  ): Promise<CooActionOutcome> {
    switch (action.type) {
      case 'ASSIGN_WORK_ORDER':
        return this.assignWorkOrder(user, action);

      case 'UPDATE_WORK_ORDER':
        return this.updateWorkOrder(user, action);

      case 'UPDATE_WORK_ORDER':
        return this.updateWorkOrder(user, action);
    }
  }

  private async assignWorkOrder(
    user: AuthenticatedUser,
    action: Extract<CooAction, { type: 'ASSIGN_WORK_ORDER' }>,
  ): Promise<CooActionOutcome> {
    const decision = await this.authorizationService.authorize(
      CanManageWorkOrders,
      {
        user,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          actionType: action.type,
          assignedToId: action.input.assignedToId,
          source: 'coo',
        },
      },
    );

    if (!decision.allowed) {
      return {
        action,
        allowed: false,
        status: 'DENIED',
        resourceId: action.resourceId,
        message: 'Ação não autorizada.',
      };
    }

    try {
      await this.workOrdersService.update(
        action.resourceId,
        user.organizationId,
        {
          assignedToId: action.input.assignedToId,
        },
      );

      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          assignedToId: action.input.assignedToId,
        },
      });

      return {
        action,
        allowed: true,
        status: 'EXECUTED',
        resourceId: action.resourceId,
        message: 'Ordem de trabalho atribuída com sucesso.',
      };
    } catch (error) {
      return {
        action,
        allowed: true,
        status: 'FAILED',
        resourceId: action.resourceId,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível executar a atribuição.',
      };
    }
  }

  private async updateWorkOrder(
    user: AuthenticatedUser,
    action: Extract<CooAction, { type: 'UPDATE_WORK_ORDER' }>,
  ): Promise<CooActionOutcome> {
    const decision = await this.authorizationService.authorize(
      CanManageWorkOrders,
      {
        user,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          actionType: action.type,
          source: 'coo',
        },
      },
    );

    if (!decision.allowed) {
      return {
        action,
        allowed: false,
        status: 'DENIED',
        resourceId: action.resourceId,
        message: 'Ação não autorizada.',
      };
    }

    try {
      await this.workOrdersService.update(
        action.resourceId,
        user.organizationId,
        action.input,
      );

      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          actionType: action.type,
          authorizationPolicy: decision.policy,
        },
      });

      return {
        action,
        allowed: true,
        status: 'EXECUTED',
        resourceId: action.resourceId,
        message: 'Ordem de trabalho atualizada com sucesso.',
      };
    } catch (error) {
      return {
        action,
        allowed: true,
        status: 'FAILED',
        resourceId: action.resourceId,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar a ordem.',
      };
    }
  }

}
