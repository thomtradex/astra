import { Body, Controller, Get, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated } from '../../common/decorators/metadata.decorators';
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

  @Get('briefing')
  briefing(@CurrentUser() user: AuthenticatedUser) {
    return this.intelligenceService.analyze(
      user.organizationId,
    );
  }

  @Post('actions')
  executeAction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ExecuteCooActionDto,
  ) {
    return this.cooActionExecutor.execute(user, {
      type: dto.type,
      resource: 'work_orders',
      resourceId: dto.resourceId,
      input: {
        assignedToId: dto.assignedToId,
      },
    });
  }
}
