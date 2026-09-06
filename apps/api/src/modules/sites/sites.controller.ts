import { Prisma } from '@astra/database';
import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SitesService } from './sites.service';

type SiteModel = Prisma.sitesGetPayload<Record<string, never>>;

@RequireBillingFeature('siteManagement')
@Controller('sites')
@Authenticated()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SITE_READ)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel[]> {
    return this.sitesService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.SITE_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel | null> {
    return this.sitesService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SITE_WRITE)
  create(
    @Body() dto: CreateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SITE_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SITE_WRITE)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.remove(id, user.organizationId);
  }
}
