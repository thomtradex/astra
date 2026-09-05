import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Authenticated, Public } from '../../common/decorators/metadata.decorators';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateCustomerPortalSessionDto } from './dto/create-customer-portal-session.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @Public()
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

  @Post('free')
  @Authenticated()
  @ApiOperation({ summary: 'Activate free plan' })
  startFree(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.ensureFreeSubscription(user.organizationId);
  }

  @Post('trial')
  @Authenticated()
  @ApiOperation({ summary: 'Start free trial subscription' })
  startTrial(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.ensureTrialSubscription(user.organizationId);
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
    return this.billingService.createCustomerPortalSession(user.organizationId, dto.returnUrl);
  }

  @Patch('plan')
  @Authenticated()
  async changePlan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpgradePlanDto,
  ) {
    return this.billingService.changePlan(user.organizationId, dto.planCode);
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
