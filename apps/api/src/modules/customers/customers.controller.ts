import { Prisma } from '@astra/database';
import { PERMISSIONS } from '@astra/shared';
import { Query,  Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePermissions } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

type CustomerModel = Prisma.customersGetPayload<Record<string, never>>;

@RequireBillingFeature('customerManagement')
@Controller('customers')
@Authenticated()
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  findAll(
    @Query() query: QueryCustomersDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(user.organizationId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel | null> {
    return this.service.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMER_WRITE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel> {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMER_WRITE)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<CustomerModel> {
    return this.service.remove(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CUSTOMER_WRITE)
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel> {
    return this.service.create(dto, user.organizationId);
  }
}
