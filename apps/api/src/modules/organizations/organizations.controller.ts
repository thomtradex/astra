import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanReadOrganizations, CanManageOrganizations } from '../authorization/policies/resource.policies';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @RequirePolicy(CanReadOrganizations.name)
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: QueryOrganizationsDto) {
    return this.organizationsService.findAll(query);
  }

  @Get('current')
  @Authenticated()
  @ApiOperation({ summary: 'Get the current authenticated organization' })
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findOne(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadOrganizations.name)
  @ApiOperation({ summary: 'Get an organization' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @RequirePolicy(CanManageOrganizations.name)
  @ApiOperation({ summary: 'Create an organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Patch('current')
  @Authenticated()
  @ApiOperation({ summary: 'Update the current authenticated organization' })
  updateCurrent(@Body() dto: UpdateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.update(user.organizationId, dto);
  }

  @Patch(':id')
  @RequirePolicy(CanManageOrganizations.name)
  @ApiOperation({ summary: 'Update an organization' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Patch(':id/active')
  @RequirePolicy(CanManageOrganizations.name)
  @ApiOperation({ summary: 'Activate or deactivate an organization' })
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.organizationsService.setActive(id, isActive);
  }
}
