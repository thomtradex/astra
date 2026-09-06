import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePolicy } from '../../common/decorators/metadata.decorators';
import { CanReadUsers } from '../authorization/policies/resource.policies';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePolicy(CanReadUsers.name)
  @ApiOperation({ summary: 'List users in the current organization' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() pagination: PaginationQueryDto) {
    return this.usersService.listByOrganization({
      organizationId: user.organizationId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }
}
