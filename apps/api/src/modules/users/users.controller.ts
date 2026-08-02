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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@astra/shared';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@Authenticated()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ApiOperation({ summary: 'List users in the current organization' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() pagination: PaginationQueryDto) {
    return this.usersService.listByOrganization({
      organizationId: user.organizationId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.findOne(
      id,
      user.organizationId,
    );
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.create(
      dto,
      user.organizationId,
    );
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(
      id,
      user.organizationId,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.remove(
      id,
      user.organizationId,
    );
  }


  @Get(':id/roles')
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  listRoles(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.listRoles(
      id,
      user.organizationId,
    );
  }

  @Post(':id/roles/:roleId')
  @RequirePermissions(PERMISSIONS.ROLE_WRITE)
  assignRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.assignRole(
      id,
      user.organizationId,
      roleId,
    );
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions(PERMISSIONS.ROLE_WRITE)
  removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.removeRole(
      id,
      user.organizationId,
      roleId,
    );
  }

}
