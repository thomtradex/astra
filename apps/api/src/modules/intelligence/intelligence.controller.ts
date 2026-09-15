import { Body, Controller, Get, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanUseIntelligence } from '../authorization/policies/intelligence.policies';

import { ExecuteCooActionDto } from './dto/execute-coo-action.dto';
import { IntelligenceService } from './intelligence.service';

@Controller('intelligence')
@Authenticated()
@RequireBillingFeature('intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @RequirePolicy(CanUseIntelligence.name)
  @Get('briefing')
  briefing(@CurrentUser() user: AuthenticatedUser) {
    return this.intelligenceService.analyze(user.organizationId);
  }

  @RequireBillingFeature('cooActions')
  @RequirePolicy(CanUseIntelligence.name)
  @Post('actions')
  executeAction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ExecuteCooActionDto,
  ) {
    if (dto.type === 'ASSIGN_WORK_ORDER') {
      return this.intelligenceService.executeCooAction(user, {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: dto.resourceId,
        input: {
          assignedToId: dto.assignedToId!,
        },
      });
    }

    if (dto.type === 'UPDATE_MAINTENANCE') {
      return this.intelligenceService.executeCooAction(user, {
        type: 'UPDATE_MAINTENANCE',
        resource: 'maintenance_plans',
        resourceId: dto.resourceId,
        input: {
          nextDue: dto.nextDue!,
        },
      });
    }

    return this.intelligenceService.executeCooAction(user, {
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: dto.resourceId,
      input: {
        status: 'ON_HOLD',
      },
    });
  }
}
