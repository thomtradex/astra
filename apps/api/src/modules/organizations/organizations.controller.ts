import { PERMISSIONS } from '@astra/shared';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../common/decorators/metadata.decorators';

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
  @RequirePermissions(PERMISSIONS.ORG_READ)
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: QueryOrganizationsDto) {
    return this.organizationsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORG_READ)
  @ApiOperation({ summary: 'Get an organization' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  @ApiOperation({ summary: 'Create an organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  @ApiOperation({ summary: 'Update an organization' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Patch(':id/active')
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  @ApiOperation({ summary: 'Activate or deactivate an organization' })
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.organizationsService.setActive(id, isActive);
  }
}
