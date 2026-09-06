import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageProjects, CanReadProjects } from '../authorization/policies/resource.policies';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@Authenticated()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @RequirePolicy(CanReadProjects.name)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(user.organizationId);
  }

  @Get(':id')
  @RequirePolicy(CanReadProjects.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageProjects.name)
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageProjects.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageProjects.name)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.remove(id, user.organizationId);
  }
}
