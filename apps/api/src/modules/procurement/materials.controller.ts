import { Prisma } from '@astra/database';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  CanManageMaterials,
  CanReadMaterials,
} from '../authorization/policies/resource.policies';

import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialsService } from './materials.service';

type MaterialModel = Prisma.materialsGetPayload<Record<string, never>>;

@RequireBillingFeature('procurementManagement')
@Controller('materials')
@Authenticated()
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

  @Get()
  @RequirePolicy(CanReadMaterials.name)
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<MaterialModel[]> {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadMaterials.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialModel> {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageMaterials.name)
  create(
    @Body() dto: CreateMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialModel> {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageMaterials.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialModel> {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageMaterials.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialModel> {
    return this.service.remove(id, user.organizationId);
  }
}
