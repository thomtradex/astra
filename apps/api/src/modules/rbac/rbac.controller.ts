import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@astra/shared';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { RbacService } from './rbac.service';

@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
@Authenticated()
export class RbacController {
  constructor(
    private readonly rbacService: RbacService,
  ) {}

  @Get('roles')
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  listRoles() {
    return this.rbacService.listRoles();
  }

  @Get('permissions')
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @RequirePermissions(PERMISSIONS.ROLE_WRITE)
  assignPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.assignPermission(
      roleId,
      permissionId,
    );
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @RequirePermissions(PERMISSIONS.ROLE_WRITE)
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.removePermission(
      roleId,
      permissionId,
    );
  }

}
