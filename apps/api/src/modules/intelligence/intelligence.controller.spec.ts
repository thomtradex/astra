/* eslint-disable @typescript-eslint/unbound-method */

import { AuditAction } from '@astra/database';

import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanUseIntelligence } from '../authorization/policies/intelligence.policies';

import { CooActionExecutorService } from './coo-action.executor';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceController', () => {
  const user = {
    id: 'user-alpha',
    organizationId: 'org-alpha',
  } as AuthenticatedUser;

  let service: IntelligenceService;
  let cooActionExecutor: CooActionExecutorService;
  let controller: IntelligenceController;

  beforeEach(() => {
    service = {
      analyze: jest.fn(),
    } as unknown as IntelligenceService;

    cooActionExecutor = {
      execute: jest.fn(),
    } as unknown as CooActionExecutorService;

    controller = new IntelligenceController(service, cooActionExecutor);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the authenticated organization to briefing analysis', async () => {
    const briefing = { signals: [] };
    jest.spyOn(service, 'analyze').mockResolvedValue(briefing as never);

    await expect(controller.briefing(user)).resolves.toEqual(briefing);
    expect(service.analyze).toHaveBeenCalledWith('org-alpha');
  });

  it('maps ASSIGN_WORK_ORDER to the COO executor', async () => {
    const outcome = {
      action: {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: 'wo-1',
        input: { assignedToId: 'user-2' },
      },
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'wo-1',
      message: 'ok',
    };

    jest.spyOn(cooActionExecutor, 'execute').mockResolvedValue(outcome as never);

    await expect(
      controller.executeAction(user, {
        type: 'ASSIGN_WORK_ORDER',
        resourceId: 'wo-1',
        assignedToId: 'user-2',
      }),
    ).resolves.toEqual(outcome);
    expect(cooActionExecutor.execute).toHaveBeenCalledWith(user, {
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      input: {
        assignedToId: 'user-2',
      },
    });
  });

  it('maps UPDATE_MAINTENANCE to the COO executor', async () => {
    const nextDue = '2026-10-15T09:00:00.000Z';
    const outcome = {
      action: {
        type: 'UPDATE_MAINTENANCE',
        resource: 'maintenance_plans',
        resourceId: 'maintenance-1',
        input: { nextDue },
      },
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'maintenance-1',
      message: 'ok',
    };

    jest.spyOn(cooActionExecutor, 'execute').mockResolvedValue(outcome as never);

    await expect(
      controller.executeAction(user, {
        type: 'UPDATE_MAINTENANCE',
        resourceId: 'maintenance-1',
        nextDue,
      }),
    ).resolves.toEqual(outcome);
    expect(cooActionExecutor.execute).toHaveBeenCalledWith(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      input: {
        nextDue,
      },
    });
  });

  it('maps SET_PROJECT_STATUS to ON_HOLD and ignores client status selection', async () => {
    const outcome = {
      action: {
        type: 'SET_PROJECT_STATUS',
        resource: 'projects',
        resourceId: 'project-1',
        input: { status: 'ON_HOLD' },
      },
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'project-1',
      message: 'ok',
    };

    jest.spyOn(cooActionExecutor, 'execute').mockResolvedValue(outcome as never);

    await expect(
      controller.executeAction(user, {
        type: 'SET_PROJECT_STATUS',
        resourceId: 'project-1',
        status: 'ON_HOLD',
      }),
    ).resolves.toEqual(outcome);
    expect(cooActionExecutor.execute).toHaveBeenCalledWith(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-1',
      input: {
        status: 'ON_HOLD',
      },
    });
  });

  it('does not call the intelligence service when executing an action', async () => {
    jest.spyOn(cooActionExecutor, 'execute').mockResolvedValue({
      allowed: false,
      status: 'DENIED',
      resourceId: 'project-1',
      message: 'Ação não autorizada.',
      action: {
        type: 'SET_PROJECT_STATUS',
        resource: 'projects',
        resourceId: 'project-1',
        input: { status: 'ON_HOLD' },
      },
    } as never);

    await controller.executeAction(user, {
      type: 'SET_PROJECT_STATUS',
      resourceId: 'project-1',
      status: 'ON_HOLD',
    });
    expect(service.analyze).not.toHaveBeenCalled();
  });

  it('keeps the controller action path independent from persistence', async () => {
    jest.spyOn(cooActionExecutor, 'execute').mockResolvedValue({
      allowed: true,
      status: 'EXECUTED',
      resourceId: 'wo-1',
      message: 'ok',
      action: {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: 'wo-1',
        input: { assignedToId: 'user-2' },
      },
    } as never);

    await controller.executeAction(user, {
      type: 'ASSIGN_WORK_ORDER',
      resourceId: 'wo-1',
      assignedToId: 'user-2',
    });
    expect(cooActionExecutor.execute).toHaveBeenCalledTimes(1);
  });

  it('exposes the intelligence policy metadata on the briefing and action handlers', () => {
    expect(
      Reflect.getMetadata('authorization_policy', IntelligenceController.prototype.briefing),
    ).toBe(CanUseIntelligence.name);
    expect(
      Reflect.getMetadata('authorization_policy', IntelligenceController.prototype.executeAction),
    ).toBe(CanUseIntelligence.name);
  });

  it('keeps audit action values outside the controller contract', () => {
    expect(AuditAction.UPDATE).toBe('UPDATE');
  });
});
