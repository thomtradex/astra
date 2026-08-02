import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@astra/shared';

import { RequirePermissions } from '../../common/decorators/metadata.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  @ApiOperation({ summary: 'List audit logs for the current organization' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditQueryDto,
  ): Promise<Awaited<ReturnType<AuditService['findByOrganization']>>> {
    return this.auditService.findByOrganization({
      organizationId: user.organizationId,
      page: query.page,
      limit: query.limit,
      resource: query.resource,
      action: query.action,
      resourceId: query.resourceId,
    });
  }
}