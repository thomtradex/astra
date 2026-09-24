import { Prisma } from '@astra/database';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  CanManageSuppliers,
  CanReadSuppliers,
} from '../authorization/policies/resource.policies';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

type SupplierModel = Prisma.suppliersGetPayload<Record<string, never>>;

@RequireBillingFeature('procurementManagement')
@Controller('suppliers')
@Authenticated()
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @RequirePolicy(CanReadSuppliers.name)
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<SupplierModel[]> {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadSuppliers.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SupplierModel> {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageSuppliers.name)
  create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SupplierModel> {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageSuppliers.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SupplierModel> {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageSuppliers.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SupplierModel> {
    return this.service.remove(id, user.organizationId);
  }
}
