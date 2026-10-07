import { Prisma } from '@astra/database';
import {
  Body,
  Controller,
  Get,
  Param,
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
  CanManageInventory,
  CanReadInventory,
} from '../authorization/policies/resource.policies';

import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';

type InventoryStockModel = Prisma.inventory_stockGetPayload<Record<string, never>>;

type InventoryStockWithRelations = Prisma.inventory_stockGetPayload<{
  include: {
    materials: true;
    sites: true;
  };
}>;

type InventoryMovementModel =
  Prisma.inventory_movementsGetPayload<Record<string, never>>;

@RequireBillingFeature('procurementManagement')
@Controller('inventory')
@Authenticated()
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @RequirePolicy(CanReadInventory.name)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('siteId') siteId?: string,
    @Query('materialId') materialId?: string,
  ): Promise<InventoryStockWithRelations[]> {
    return this.service.findAll(user.organizationId, siteId, materialId);
  }

  @Get('by-material-site')
  @RequirePolicy(CanReadInventory.name)
  findByMaterialAndSite(
    @Query('materialId') materialId: string,
    @Query('siteId') siteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryStockModel | null> {
    return this.service.findByMaterialAndSite(
      materialId,
      siteId,
      user.organizationId,
    );
  }

  @Get(':id')
  @RequirePolicy(CanReadInventory.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryStockWithRelations> {
    return this.service.findOne(id, user.organizationId);
  }

  @Post('movements')
  @RequirePolicy(CanManageInventory.name)
  createMovement(
    @Body() dto: CreateInventoryMovementDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovementModel> {
    return this.service.createMovement(dto, user.organizationId);
  }
}
