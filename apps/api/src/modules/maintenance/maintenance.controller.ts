import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageMaintenance, CanReadMaintenance } from '../authorization/policies/resource.policies';

import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { MaintenanceService } from './maintenance.service';

@RequireBillingFeature('maintenanceManagement')
@Controller('maintenance')
@Authenticated()
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Get()
  @RequirePolicy(CanReadMaintenance.name)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadMaintenance.name)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageMaintenance.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenancePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageMaintenance.name)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageMaintenance.name)
  create(@Body() dto: CreateMaintenancePlanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
