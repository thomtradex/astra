import { Prisma } from '@astra/database';
import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

type WorkOrderModel = Prisma.work_ordersGetPayload<Record<string, never>>;

@Controller('work-orders')
@Authenticated()
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.WORK_ORDER_READ)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.WORK_ORDER_WRITE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkOrderDto,
  ): Promise<WorkOrderModel> {
    return this.service.create(user.organizationId, dto);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.WORK_ORDER_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderModel | null> {
    return this.service.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.WORK_ORDER_WRITE)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Prisma.work_ordersUpdateInput,
  ) {
    return this.service.update(id, user.organizationId, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.WORK_ORDER_DELETE)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.organizationId);
  }
}
