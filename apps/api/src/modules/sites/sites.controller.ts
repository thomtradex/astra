import { Prisma } from '@astra/database';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageSites, CanReadSites } from '../authorization/policies/resource.policies';

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
  @RequirePolicy(CanReadSites.name)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel[]> {
    return this.sitesService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadSites.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel | null> {
    return this.sitesService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageSites.name)
  create(
    @Body() dto: CreateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageSites.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageSites.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() _pagination: PaginationQueryDto,
  ): Promise<SiteModel> {
    return this.sitesService.remove(id, user.organizationId);
  }
}
