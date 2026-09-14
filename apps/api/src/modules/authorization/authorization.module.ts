import { Global, Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';

import { AuthorizationService } from './authorization.service';
import { PolicyRegistry } from './policy.registry';

@Global()
@Module({
  imports: [AuditModule],
  providers: [AuthorizationService, PolicyRegistry],
  exports: [AuthorizationService, PolicyRegistry],
})
export class AuthorizationModule {}
