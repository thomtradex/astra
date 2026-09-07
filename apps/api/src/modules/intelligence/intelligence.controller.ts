import { CanUseIntelligence } from '../authorization/policies/intelligence.policies';
import { Body, Controller, Get, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { ExecuteCooActionDto } from './dto/execute-coo-action.dto';
import { CooActionExecutorService } from './coo-action.executor';
import { IntelligenceService } from './intelligence.service';

@Controller('intelligence')
@Authenticated()
@RequireBillingFeature('intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly cooActionExecutor: CooActionExecutorService,
  ) {}

  @RequirePolicy(CanUseIntelligence.name)
  @Get('briefing')
  briefing(@CurrentUser() user: AuthenticatedUser) {
    return this.intelligenceService.analyze(
      user.organizationId,
    );
  }

  @RequirePolicy(CanUseIntelligence.name)
  @Post('actions')
  executeAction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ExecuteCooActionDto,
  ) {
    if (dto.type === 'ASSIGN_WORK_ORDER') {
      return this.cooActionExecutor.execute(user, {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: dto.resourceId,
        input: {
          assignedToId: dto.assignedToId!,
        },
      });
    }

    return this.cooActionExecutor.execute(user, {
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: dto.resourceId,
      input: {
        nextDue: dto.nextDue!,
      },
    });
  }
}
