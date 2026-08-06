import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { PERMISSIONS } from '@astra/shared';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { MaintenanceService } from './maintenance.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';

@Controller('maintenance')
@Authenticated()
export class MaintenanceController {
  constructor(
    private readonly service: MaintenanceService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ORG_READ)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORG_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findOne(
      id,
      user.organizationId,
    );
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  create(
    @Body() dto: CreateMaintenancePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(
      dto,
      user.organizationId,
    );
  }
}
