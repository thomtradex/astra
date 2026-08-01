import { PERMISSIONS } from '@astra/shared';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
@Authenticated()
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ORG_READ)
  findAll(
    @Query() query: PaginationQueryDto,
  ) {
    return this.organizationsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORG_READ)
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ORG_WRITE)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
