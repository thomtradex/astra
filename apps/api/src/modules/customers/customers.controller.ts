import { Prisma } from '@astra/database';
import { Query,  Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RequireBillingFeature } from '../../common/decorators/billing-entitlement.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, RequirePolicy } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CanManageCustomers, CanReadCustomers } from '../authorization/policies/resource.policies';

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
  @RequirePolicy(CanReadCustomers.name)
  findAll(
    @Query() query: QueryCustomersDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(user.organizationId, query);
  }

  @Get(':id')
  @RequirePolicy(CanReadCustomers.name)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel | null> {
    return this.service.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePolicy(CanManageCustomers.name)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel> {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePolicy(CanManageCustomers.name)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<CustomerModel> {
    return this.service.remove(id, user.organizationId);
  }

  @Post()
  @RequirePolicy(CanManageCustomers.name)
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerModel> {
    return this.service.create(dto, user.organizationId);
  }
}
