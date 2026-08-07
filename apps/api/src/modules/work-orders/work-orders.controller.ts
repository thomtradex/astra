import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Prisma } from '@astra/database';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

type WorkOrderModel = Prisma.WorkOrderGetPayload<Record<string, never>>;

@Controller('work-orders')
@Authenticated()
export class WorkOrdersController {
  constructor(
    private readonly service: WorkOrdersService,
  ) {}

  @Get()
  @RequirePermissions('work_order:read')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @RequirePermissions('work_order:write')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkOrderDto,
  ): Promise<WorkOrderModel> {
    return this.service.create(
      user.organizationId,
      dto,
    );
  }

  @Get(':id')
  @RequirePermissions('work_order:read')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderModel | null> {
    return this.service.findOne(
      id,
      user.organizationId,
    );
  }

  @Patch(':id')
  @RequirePermissions('work_order:write')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Prisma.WorkOrderUpdateInput,
  ) {
    return this.service.update(
      id,
      user.organizationId,
      body,
    );
  }

  @Delete(':id')
  @RequirePermissions('work_order:delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.remove(
      id,
      user.organizationId,
    );
  }
}
