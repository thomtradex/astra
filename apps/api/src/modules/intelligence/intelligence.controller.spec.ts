import { Permission, SystemRole } from '@astra/shared';

import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { ExecuteCooActionDto } from './dto/execute-coo-action.dto';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceController', () => {
  let controller: IntelligenceController;
  let intelligenceService: {
    analyze: jest.Mock;
    executeCooAction: jest.Mock;
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    username: 'test-user',
    organizationId: 'org-1',
    roles: ['SUPER_ADMIN'] as SystemRole[],
    permissions: ['intelligence:read'] as Permission[],
  };

  beforeEach(() => {
    intelligenceService = {
      analyze: jest.fn(),
      executeCooAction: jest.fn(),
    };

    controller = new IntelligenceController(
      intelligenceService as unknown as IntelligenceService,
    );
  });

  it('maps ASSIGN_WORK_ORDER to IntelligenceService', async () => {
    const expected = {
      status: 'EXECUTED',
      allowed: true,
      resourceId: 'wo-1',
    };

    intelligenceService.executeCooAction.mockResolvedValue(expected);

    const dto: ExecuteCooActionDto = {
      type: 'ASSIGN_WORK_ORDER',
      resourceId: 'wo-1',
      assignedToId: 'user-2',
    };

    const result = await controller.executeAction(user, dto);

    expect(result).toBe(expected);
    expect(intelligenceService.executeCooAction).toHaveBeenCalledWith(user, {
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      input: {
        assignedToId: 'user-2',
      },
    });
  });

  it('maps UPDATE_MAINTENANCE to IntelligenceService', async () => {
    const expected = {
      status: 'EXECUTED',
      allowed: true,
      resourceId: 'maintenance-1',
    };

    intelligenceService.executeCooAction.mockResolvedValue(expected);

    const dto: ExecuteCooActionDto = {
      type: 'UPDATE_MAINTENANCE',
      resourceId: 'maintenance-1',
      nextDue: '2026-10-01T00:00:00.000Z',
    };

    const result = await controller.executeAction(user, dto);

    expect(result).toBe(expected);
    expect(intelligenceService.executeCooAction).toHaveBeenCalledWith(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      input: {
        nextDue: '2026-10-01T00:00:00.000Z',
      },
    });
  });

  it('maps SET_PROJECT_STATUS to ON_HOLD and ignores client status selection', async () => {
    const expected = {
      status: 'EXECUTED',
      allowed: true,
      resourceId: 'project-1',
    };

    intelligenceService.executeCooAction.mockResolvedValue(expected);

    const dto = {
      type: 'SET_PROJECT_STATUS',
      resourceId: 'project-1',
      status: 'ON_HOLD',
    } as ExecuteCooActionDto;

    const result = await controller.executeAction(user, dto);

    expect(result).toBe(expected);
    expect(intelligenceService.executeCooAction).toHaveBeenCalledWith(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-1',
      input: {
        status: 'ON_HOLD',
      },
    });
  });

  it('routes action execution through IntelligenceService', async () => {
    intelligenceService.executeCooAction.mockResolvedValue({
      status: 'EXECUTED',
    });

    const dto: ExecuteCooActionDto = {
      type: 'ASSIGN_WORK_ORDER',
      resourceId: 'wo-1',
      assignedToId: 'user-2',
    };

    await controller.executeAction(user, dto);

    expect(intelligenceService.executeCooAction).toHaveBeenCalledTimes(1);
    expect(intelligenceService.analyze).not.toHaveBeenCalled();
  });

  it('keeps the controller independent from persistence and COO executor internals', async () => {
    intelligenceService.executeCooAction.mockResolvedValue({
      status: 'EXECUTED',
    });

    const dto: ExecuteCooActionDto = {
      type: 'ASSIGN_WORK_ORDER',
      resourceId: 'wo-1',
      assignedToId: 'user-2',
    };

    await expect(controller.executeAction(user, dto)).resolves.toEqual({
      status: 'EXECUTED',
    });

    expect(intelligenceService.executeCooAction).toHaveBeenCalled();
  });
});
