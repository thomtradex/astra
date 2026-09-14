
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { BillingEntitlementGuard } from './common/guards/billing-entitlement.guard';
import { AppConfigModule } from './config/config.module';
import { AiModule } from './modules/ai/ai.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { PolicyGuard } from './modules/authorization/guards/policy.guard';
import { BillingModule } from './modules/billing/billing.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EnterpriseRequestsModule } from './modules/enterprise-requests/enterprise-requests.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { HealthModule } from './modules/health/health.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { SitesModule } from './modules/sites/sites.module';
import { UsersModule } from './modules/users/users.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ProjectsModule,
    AuthorizationModule,
    BillingModule,
    AppConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    HealthModule,
    OrganizationsModule,
    EnterpriseRequestsModule,
    CustomersModule,
    DashboardModule,
    SitesModule,
    AssetsModule,
    WorkOrdersModule,
    MaintenanceModule,
    IntelligenceModule,
    AiModule,
    ScoringModule,
    ForecastingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PolicyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BillingEntitlementGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
