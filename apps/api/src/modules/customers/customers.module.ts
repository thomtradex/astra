import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [BillingModule,PrismaModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
