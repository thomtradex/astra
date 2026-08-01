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

import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

type SiteModel = Prisma.SiteGetPayload<Record<string, never>>;

@Controller('sites')
@Authenticated()
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
  ) {}

  @Get()
  @RequirePermissions('org:read')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteModel[]> {
    return this.sitesService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('org:read')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteModel | null> {
    return this.sitesService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions('org:write')
  create(
    @Body() dto: CreateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteModel> {
    return this.sitesService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('org:write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteModel> {
    return this.sitesService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('org:write')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteModel> {
    return this.sitesService.remove(id, user.organizationId);
  }
}
