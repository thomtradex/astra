import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import {
  Authenticated,
  RequirePermissions,
} from '../../common/decorators/metadata.decorators';
import { PERMISSIONS } from '@astra/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
@Authenticated()
export class CustomersController {
  constructor(
    private readonly service: CustomersService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(
      user.organizationId,
    );
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CUSTOMER_WRITE)
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(
      dto,
      user.organizationId,
    );
  }
}
