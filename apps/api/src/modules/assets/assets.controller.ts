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

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AssetModel = Prisma.AssetGetPayload<Record<string, never>>;

@Controller('assets')
@Authenticated()
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssetModel[]> {
    return this.assetsService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('org:read')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssetModel | null> {
    return this.assetsService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions('org:write')
  create(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssetModel> {
    return this.assetsService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('org:write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssetModel> {
    return this.assetsService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('org:write')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssetModel> {
    return this.assetsService.remove(id, user.organizationId);
  }
}
