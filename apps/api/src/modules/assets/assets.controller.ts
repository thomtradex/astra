import { Prisma } from '@astra/database';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageAssets, CanReadAssets } from '../authorization/policies/resource.policies';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AssetModel = Prisma.assetsGetPayload<Record<string, never>>;

@RequireBillingFeature('assetManagement')
@Controller('assets')
@Authenticated()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @RequirePolicy(CanReadAssets.name)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel[]> {
    return this.assetsService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadAssets.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel | null> {
    return this.assetsService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageAssets.name)
  create(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageAssets.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageAssets.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.remove(id, user.organizationId);
  }
}
