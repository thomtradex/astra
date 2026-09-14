import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanReadDashboard } from '../authorization/policies/dashboard.policies';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @RequirePolicy(CanReadDashboard.name)
  @Get('overview')
  @Authenticated()
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.service.overview(user.organizationId);
  }
}
