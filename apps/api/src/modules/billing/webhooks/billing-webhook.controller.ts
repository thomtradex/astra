import { Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { BillingWebhookService } from './billing-webhook.service';

@Controller('billing/webhooks')
export class BillingWebhookController {
  constructor(private readonly billingWebhookService: BillingWebhookService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async stripe(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new Error('Stripe webhook raw body is unavailable');
    }

    return this.billingWebhookService.handleStripeWebhook(req.rawBody, signature);
  }
}
