import { Test } from '@nestjs/testing';

import { PAYMENT_PROVIDER } from './payment.constants';
import { PaymentModule } from './payment.module';

describe('PaymentModule', () => {
  it('exports payment provider', async () => {
    const module = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    expect(module.get(PAYMENT_PROVIDER)).toBeDefined();
  });
});
