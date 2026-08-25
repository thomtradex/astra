import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BillingService } from './billing.service';
import { CreateCustomerPortalSessionDto } from './dto/create-customer-portal-session.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @Authenticated()
  @ApiOperation({ summary: 'List active billing plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('subscription')
  @Authenticated()
  @ApiOperation({ summary: 'Get current organization subscription' })
  getSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getSubscription(user.organizationId);
  }

  @Get('entitlements')
  @Authenticated()
  @ApiOperation({ summary: 'Get current billing entitlements' })
  getEntitlements(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getEntitlements(user.organizationId);
  }

  @Post('checkout')
  @Authenticated()
  @ApiOperation({ summary: 'Create Stripe Checkout session' })
  createCheckout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCheckoutSessionDto) {
    return this.billingService.createCheckoutSession(user.organizationId, dto.planCode, user.email);
  }

  @Post('portal')
  @Authenticated()
  @ApiOperation({ summary: 'Create Stripe Billing Portal session' })
  createPortal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCustomerPortalSessionDto,
  ) {
    return this.billingService.createCustomerPortalSession(
      user.organizationId,
      dto.returnUrl,
    );
  }

  @Patch('cancel')
  @Authenticated()
  @ApiOperation({
    summary: 'Cancel subscription at the end of the period',
  })
  cancel(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.cancelAtPeriodEnd(user.organizationId);
  }

  @Patch('reactivate')
  @Authenticated()
  @ApiOperation({
    summary: 'Reactivate a scheduled cancellation',
  })
  reactivate(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.reactivate(user.organizationId);
  }
}
