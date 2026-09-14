import { AuditAction } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../authorization/authorization.service';
import {
  CanManageMaintenance,
  CanManageProjects,
} from '../authorization/policies/resource.policies';
import { CanManageWorkOrders } from '../authorization/policies/work-order.policies';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';

import { CooAction, CooActionExecutor, CooActionOutcome } from './coo-actions.types';

@Injectable()
export class CooActionExecutorService implements CooActionExecutor {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
    private readonly workOrdersService: WorkOrdersService,
    private readonly maintenanceService: MaintenanceService,
    private readonly projectsService: ProjectsService,
  ) {}

  async execute(user: AuthenticatedUser, action: CooAction): Promise<CooActionOutcome> {
    switch (action.type) {
      case 'ASSIGN_WORK_ORDER':
        return this.assignWorkOrder(user, action);

      case 'UPDATE_MAINTENANCE':
        return this.updateMaintenance(user, action);

      case 'SET_PROJECT_STATUS':
        return this.setProjectStatus(user, action);

      default: {
        const exhaustiveCheck: never = action;
        throw new Error(`Unsupported COO action: ${String(exhaustiveCheck)}`);
      }
    }
  }

  private async assignWorkOrder(
    user: AuthenticatedUser,
    action: Extract<CooAction, { type: 'ASSIGN_WORK_ORDER' }>,
  ): Promise<CooActionOutcome> {
    const decision = await this.authorizationService.authorize(CanManageWorkOrders, {
      user,
      resource: action.resource,
      resourceId: action.resourceId,
      metadata: {
        actionType: action.type,
        assignedToId: action.input.assignedToId,
        source: 'coo',
      },
    });

    if (!decision.allowed) {
      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.ACCESS_DENIED,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'DENIED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          reason: decision.reason,
          assignedToId: action.input.assignedToId,
        },
      });

      return {
        action,
        allowed: false,
        status: 'DENIED',
        resourceId: action.resourceId,
        message: 'Ação não autorizada.',
      };
    }

    try {
      await this.workOrdersService.update(action.resourceId, user.organizationId, {
        assignedToId: action.input.assignedToId,
      });

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
          outcomeStatus: 'EXECUTED',
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
      const message =
        error instanceof Error ? error.message : 'Não foi possível executar a atribuição.';

      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'FAILED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          assignedToId: action.input.assignedToId,
          message,
        },
      });

      return {
        action,
        allowed: false,
        status: 'FAILED',
        resourceId: action.resourceId,
        message,
      };
    }
  }

  private async updateMaintenance(
    user: AuthenticatedUser,
    action: Extract<CooAction, { type: 'UPDATE_MAINTENANCE' }>,
  ): Promise<CooActionOutcome> {
    const decision = await this.authorizationService.authorize(CanManageMaintenance, {
      user,
      resource: action.resource,
      resourceId: action.resourceId,
      metadata: {
        actionType: action.type,
        nextDue: action.input.nextDue,
        source: 'coo',
      },
    });

    if (!decision.allowed) {
      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.ACCESS_DENIED,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'DENIED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          reason: decision.reason,
          nextDue: action.input.nextDue,
        },
      });

      return {
        action,
        allowed: false,
        status: 'DENIED',
        resourceId: action.resourceId,
        message: 'Ação não autorizada.',
      };
    }

    try {
      await this.maintenanceService.update(
        action.resourceId,
        {
          nextDue: action.input.nextDue,
        },
        user.organizationId,
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
          outcomeStatus: 'EXECUTED',
          authorizationPolicy: decision.policy,
          nextDue: action.input.nextDue,
        },
      });

      return {
        action,
        allowed: true,
        status: 'EXECUTED',
        resourceId: action.resourceId,
        message: 'Manutenção reagendada com sucesso.',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível reagendar a manutenção.';

      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'FAILED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          nextDue: action.input.nextDue,
          message,
        },
      });

      return {
        action,
        allowed: false,
        status: 'FAILED',
        resourceId: action.resourceId,
        message,
      };
    }
  }

  private async setProjectStatus(
    user: AuthenticatedUser,
    action: Extract<CooAction, { type: 'SET_PROJECT_STATUS' }>,
  ): Promise<CooActionOutcome> {
    const decision = await this.authorizationService.authorize(CanManageProjects, {
      user,
      resource: action.resource,
      resourceId: action.resourceId,
      metadata: {
        actionType: action.type,
        status: action.input.status,
        source: 'coo',
      },
    });

    if (!decision.allowed) {
      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.ACCESS_DENIED,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'DENIED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          reason: decision.reason,
          status: action.input.status,
        },
      });

      return {
        action,
        allowed: false,
        status: 'DENIED',
        resourceId: action.resourceId,
        message: 'Ação não autorizada.',
      };
    }

    try {
      await this.projectsService.update(
        action.resourceId,
        {
          status: action.input.status,
        },
        user.organizationId,
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
          outcomeStatus: 'EXECUTED',
          authorizationPolicy: decision.policy,
          status: action.input.status,
        },
      });

      return {
        action,
        allowed: true,
        status: 'EXECUTED',
        resourceId: action.resourceId,
        message: 'Projeto colocado em pausa com sucesso.',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível colocar o projeto em pausa.';

      await this.auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: action.resource,
        resourceId: action.resourceId,
        metadata: {
          type: 'coo_action',
          source: 'coo',
          outcomeStatus: 'FAILED',
          actionType: action.type,
          authorizationPolicy: decision.policy,
          status: action.input.status,
          message,
        },
      });

      return {
        action,
        allowed: false,
        status: 'FAILED',
        resourceId: action.resourceId,
        message,
      };
    }
  }
}
