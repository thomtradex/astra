import { Global, Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';

import { AuthorizationService } from './authorization.service';

@Global()
@Module({
  imports: [AuditModule],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
