import { Module } from '@nestjs/common';
import { PAYMENT_PROVIDER } from './payment.constants';

import { StripeProvider } from './stripe.provider';

@Module({
  providers: [
    StripeProvider,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: StripeProvider,
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentModule {}
