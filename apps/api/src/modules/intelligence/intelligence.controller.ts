import { Controller, Get } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { IntelligenceService } from './intelligence.service';

@Controller('intelligence')
@Authenticated()
@RequireBillingFeature('intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @Get('briefing')
  briefing(@CurrentUser() user: AuthenticatedUser) {
    return this.intelligenceService.analyze(
      user.organizationId,
    );
  }
}
