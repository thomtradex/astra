import { AuditAction } from '@astra/database';
import { NotFoundException } from '@nestjs/common';

import { AuthorizationService } from '../authorization/authorization.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { ProjectsService } from '../projects/projects.service';
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

  const maintenanceService = {
    update: jest.fn(),
  } as unknown as MaintenanceService;


  const projectsService = {
    update: jest.fn(),
  } as unknown as ProjectsService & {
    update: jest.Mock;
  };
  let service: CooActionExecutorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CooActionExecutorService(
      authorizationService,
      auditService,
      workOrdersService,
      maintenanceService,
      projectsService,
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


  it('executes UPDATE_MAINTENANCE after authorization', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageMaintenance',
        reason: 'permissions_satisfied',
        requiredPermissions: ['maintenance:write'],
      });

    jest
      .spyOn(maintenanceService, 'update')
      .mockResolvedValue({
        id: 'maintenance-1',
        plan: 'Inspeção preventiva',
        assetId: 'asset-1',
        frequency: '30d',
        nextDue: new Date('2026-10-15T09:00:00.000Z'),
        status: 'ACTIVE',
        organization_id: 'org-alpha',
        created_at: new Date(),
        updated_at: new Date(),
      });

    const nextDue = '2026-10-15T09:00:00.000Z';

    const result = await service.execute(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      input: {
        nextDue,
      },
    });

    expect(result).toEqual({
      action: {
        type: 'UPDATE_MAINTENANCE',
        resource: 'maintenance_plans',
        resourceId: 'maintenance-1',
        input: {
          nextDue,
        },
      },
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'maintenance-1',
      message: 'Manutenção reagendada com sucesso.',
    });

    expect(authorizationService.authorize).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        user,
        resource: 'maintenance_plans',
        resourceId: 'maintenance-1',
        metadata: expect.objectContaining({
          actionType: 'UPDATE_MAINTENANCE',
          nextDue,
          source: 'coo',
        }),
      }),
    );

    expect(maintenanceService.update).toHaveBeenCalledWith(
      'maintenance-1',
      {
        nextDue,
      },
      'org-alpha',
    );

    expect(auditService.log).toHaveBeenCalledWith({
      organizationId: 'org-alpha',
      actorId: 'user-alpha',
      action: 'UPDATE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      metadata: {
        type: 'coo_action',
        source: 'coo',
        actionType: 'UPDATE_MAINTENANCE',
        authorizationPolicy: 'CanManageMaintenance',
        nextDue,
      },
    });
  });

  it('does not mutate maintenance when authorization is denied', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: false,
        policy: 'CanManageMaintenance',
        reason: 'missing_permissions',
        requiredPermissions: ['maintenance:write'],
      });

    const result = await service.execute(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      input: {
        nextDue: '2026-10-15T09:00:00.000Z',
      },
    });

    expect(result.status).toBe('DENIED');
    expect(result.allowed).toBe(false);
    expect(maintenanceService.update).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('returns FAILED when maintenance mutation fails', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageMaintenance',
        reason: 'permissions_satisfied',
        requiredPermissions: ['maintenance:write'],
      });

    jest
      .spyOn(maintenanceService, 'update')
      .mockRejectedValue(
        new NotFoundException('Maintenance plan not found'),
      );

    const result = await service.execute(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      input: {
        nextDue: '2026-10-15T09:00:00.000Z',
      },
    });

    expect(result.status).toBe('FAILED');
    expect(result.allowed).toBe(true);
    expect(maintenanceService.update).toHaveBeenCalledWith(
      'maintenance-1',
      {
        nextDue: '2026-10-15T09:00:00.000Z',
      },
      'org-alpha',
    );
    expect(auditService.log).not.toHaveBeenCalled();
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

  it('executes SET_PROJECT_STATUS after authorization', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageProjects',
        reason: 'permissions_satisfied',
        requiredPermissions: ['project:write'],
      });

    projectsService.update.mockResolvedValue({
      id: 'project-1',
      status: 'ON_HOLD',
    });

    const outcome = await service.execute(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-1',
      input: {
        status: 'ON_HOLD',
      },
    });

    expect(projectsService.update).toHaveBeenCalledWith(
      'project-1',
      { status: 'ON_HOLD' },
      user.organizationId,
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: user.organizationId,
        actorId: user.id,
        action: AuditAction.UPDATE,
        resource: 'projects',
        resourceId: 'project-1',
        metadata: expect.objectContaining({
          type: 'coo_action',
          source: 'coo',
          actionType: 'SET_PROJECT_STATUS',
          status: 'ON_HOLD',
        }),
      }),
    );
    expect(outcome).toEqual(
      expect.objectContaining({
        allowed: true,
        status: 'EXECUTED',
        resourceId: 'project-1',
        message: 'Projeto colocado em pausa com sucesso.',
      }),
    );
  });

  it('does not mutate project when SET_PROJECT_STATUS authorization is denied', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: false,
        policy: 'CanManageProjects',
        reason: 'permission_denied',
        requiredPermissions: ['project:write'],
      });

    const outcome = await service.execute(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-1',
      input: {
        status: 'ON_HOLD',
      },
    });

    expect(projectsService.update).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
    expect(outcome).toEqual(
      expect.objectContaining({
        allowed: false,
        status: 'DENIED',
        resourceId: 'project-1',
      }),
    );
  });

  it('returns FAILED when project status mutation fails', async () => {
    jest
      .spyOn(authorizationService, 'authorize')
      .mockResolvedValue({
        allowed: true,
        policy: 'CanManageProjects',
        reason: 'permissions_satisfied',
        requiredPermissions: ['project:write'],
      });

    projectsService.update.mockRejectedValue(
      new Error('Project update failed'),
    );

    const outcome = await service.execute(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-1',
      input: {
        status: 'ON_HOLD',
      },
    });

    expect(auditService.log).not.toHaveBeenCalled();
    expect(outcome).toEqual(
      expect.objectContaining({
        allowed: true,
        status: 'FAILED',
        resourceId: 'project-1',
        message: 'Project update failed',
      }),
    );
  });

});
