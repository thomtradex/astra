import { Prisma } from '@astra/database';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  Authenticated,
  RequirePolicy,
} from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  CanManageWorkOrderMaterials,
  CanReadWorkOrderMaterials,
} from '../authorization/policies/resource.policies';

import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CreateWorkOrderMaterialDto } from './dto/create-work-order-material.dto';
import { UpdateWorkOrderMaterialDto } from './dto/update-work-order-material.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { WorkOrderMaterialsService } from './work-order-materials.service';

type WorkOrderMaterialModel =
  Prisma.work_order_materialsGetPayload<Record<string, never>>;

@RequireBillingFeature('procurementManagement')
@Controller('work-order-materials')
@Authenticated()
export class WorkOrderMaterialsController {
  constructor(private readonly service: WorkOrderMaterialsService) {}

  @Get()
  @RequirePolicy(CanReadWorkOrderMaterials.name)
  findAll(
    @Query('workOrderId') workOrderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel[]> {
    return this.service.findAll(workOrderId, user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadWorkOrderMaterials.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageWorkOrderMaterials.name)
  create(
    @Body() dto: CreateWorkOrderMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageWorkOrderMaterials.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.update(id, dto, user.organizationId);
  }

  @Post('reserve')
  @RequirePolicy(CanManageWorkOrderMaterials.name)
  reserve(
    @Body() dto: ReserveInventoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.reserve(dto, user.organizationId);
  }

  @Post('consume')
  @RequirePolicy(CanManageWorkOrderMaterials.name)
  consume(
    @Body() dto: ConsumeInventoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.consume(dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageWorkOrderMaterials.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderMaterialModel> {
    return this.service.remove(id, user.organizationId);
  }
}
