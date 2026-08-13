import { Prisma } from '@astra/database';
import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AssetModel = Prisma.assetsGetPayload<Record<string, never>>;

@Controller('assets')
@Authenticated()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ASSET_READ)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel[]> {
    return this.assetsService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ASSET_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel | null> {
    return this.assetsService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ASSET_WRITE)
  create(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ASSET_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ASSET_WRITE)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<AssetModel> {
    return this.assetsService.remove(id, user.organizationId);
  }
}
