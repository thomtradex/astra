import { Controller, Get } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { DashboardService } from './dashboard.service';

@RequireBillingFeature('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview')
  @Authenticated()
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.service.overview(user.organizationId);
  }
}
