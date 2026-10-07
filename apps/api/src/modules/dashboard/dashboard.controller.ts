import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BillingService } from '../billing/billing.service';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanReadDashboard } from '../authorization/policies/dashboard.policies';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly service: DashboardService,
    private readonly billingService: BillingService,
  ) {}

  @RequirePolicy(CanReadDashboard.name)
  @Get('overview')
  @Authenticated()
  async overview(@CurrentUser() user: AuthenticatedUser) {
    const entitlements = await this.billingService.getEntitlements(user.organizationId);

    return this.service.overview(user.organizationId, entitlements.features.intelligence === true);
  }
}
