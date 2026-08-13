import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@Authenticated()
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MAINTENANCE_READ)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_READ)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  create(@Body() dto: CreateMaintenancePlanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
