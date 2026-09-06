import { NotFoundException } from '@nestjs/common';

import { AuthorizationService } from '../authorization/authorization.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { WorkOrdersService } from '../work-orders/work-orders.service';

import { CooActionExecutorService } from './coo-action.executor';

describe('CooActionExecutorService', () => {
  const user: AuthenticatedUser = {
    id: 'user-alpha',
    email: 'alpha@example.com',
    organizationId: 'org-alpha',
    roles: [],
    permissions: ['work_order:write'],
  };

  const authorizationService = {
    authorize: jest.fn(),
  } as unknown as AuthorizationService;

  const auditService = {
    log: jest.fn(),
  } as unknown as AuditService;

  const workOrdersService = {
    update: jest.fn(),
  } as unknown as WorkOrdersService;

  let service: CooActionExecutorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CooActionExecutorService(
      authorizationService,
      auditService,
      workOrdersService,
    );
  });

  it('executes ASSIGN_WORK_ORDER after authorization', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageWorkOrders',
        reason: 'permissions_satisfied',
        requiredPermissions: ['work_order:write'],
      });

    jest
      .spyOn(workOrdersService, 'update')
      .mockResolvedValue({
        id: 'wo-1',
        title: 'Urgente',
        description: null,
        status: 'OPEN',
        priority: 'HIGH',
        organization_id: 'org-1',
        project_id: null,
        asset_id: null,
        assigned_to_id: 'user-2',
        created_at: new Date(),
        updated_at: new Date(),
      });

    const result = await service.execute(user, {
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      input: {
        assignedToId: 'user-2',
      },
    });

    expect(result).toEqual({
      action: {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: 'wo-1',
        input: {
          assignedToId: 'user-2',
        },
      },
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'wo-1',
      message: 'Ordem de trabalho atribuída com sucesso.',
    });

    expect(authorizationService.authorize).toHaveBeenCalledTimes(1);
    expect(workOrdersService.update).toHaveBeenCalledWith(
      'wo-1',
      'org-alpha',
      {
        assignedToId: 'user-2',
      },
    );

    expect(auditService.log).toHaveBeenCalledWith({
      organizationId: 'org-alpha',
      actorId: 'user-alpha',
      action: 'UPDATE',
      resource: 'work_orders',
      resourceId: 'wo-1',
      metadata: {
        type: 'coo_action',
        source: 'coo',
        actionType: 'ASSIGN_WORK_ORDER',
        authorizationPolicy: 'CanManageWorkOrders',
        assignedToId: 'user-2',
      },
    });
  });

  it('does not mutate when authorization is denied', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: false,
        policy: 'CanManageWorkOrders',
        reason: 'missing_permissions',
        requiredPermissions: ['work_order:write'],
      });

    const result = await service.execute(user, {
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      input: {
        assignedToId: 'user-2',
      },
    });

    expect(result.status).toBe('DENIED');
    expect(result.allowed).toBe(false);
    expect(workOrdersService.update).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('returns FAILED when the domain mutation fails', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageWorkOrders',
        reason: 'permissions_satisfied',
        requiredPermissions: ['work_order:write'],
      });

    jest
      .spyOn(workOrdersService, 'update')
      .mockRejectedValue(new NotFoundException('Work order not found'));

    const result = await service.execute(user, {
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      input: {
        assignedToId: 'user-2',
      },
    });

    expect(result.status).toBe('FAILED');
    expect(result.allowed).toBe(true);
    expect(auditService.log).not.toHaveBeenCalled();
  });
});
