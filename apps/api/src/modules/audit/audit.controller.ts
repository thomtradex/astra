import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';

import { PERMISSIONS } from '@astra/shared';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@RequireBillingFeature('auditLogs')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  @ApiOperation({ summary: 'List audit logs for the current organization' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditQueryDto,
  ): Promise<unknown> {
    return this.auditService.findByOrganization({
      organizationId: user.organizationId,
      page: query.page,
      limit: query.limit,
      resource: query.resource,
      action: query.action,
    });
  }
}
