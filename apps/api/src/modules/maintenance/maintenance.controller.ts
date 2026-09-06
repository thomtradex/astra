import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { MaintenanceService } from './maintenance.service';

@RequireBillingFeature('maintenanceManagement')
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

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenancePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  create(@Body() dto: CreateMaintenancePlanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
