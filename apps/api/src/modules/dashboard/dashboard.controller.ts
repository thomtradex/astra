import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@astra/shared';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @Authenticated()
  @RequirePermissions(PERMISSIONS.ORG_READ)
  @ApiOperation({
    summary: 'Dashboard summary',
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}