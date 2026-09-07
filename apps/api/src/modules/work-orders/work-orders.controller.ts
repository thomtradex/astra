import { Prisma } from '@astra/database';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageWorkOrders, CanReadWorkOrders } from '../authorization/policies/resource.policies';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

type WorkOrderModel = Prisma.work_ordersGetPayload<Record<string, never>>;

@RequireBillingFeature('workOrderManagement')
@Controller('work-orders')
@Authenticated()
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Get()
  @RequirePolicy(CanReadWorkOrders.name)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageWorkOrders.name)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkOrderDto,
  ): Promise<WorkOrderModel> {
    return this.service.create(user.organizationId, dto);
  }

  @Get(':id')
  @RequirePolicy(CanReadWorkOrders.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderModel | null> {
    return this.service.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageWorkOrders.name)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.service.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  @RequirePolicy(CanManageWorkOrders.name)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.organizationId);
  }
}
