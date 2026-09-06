import { Test } from '@nestjs/testing';
import { PaymentModule } from './payment.module';
import { PAYMENT_PROVIDER } from './payment.constants';

describe('PaymentModule', () => {
  it('exports payment provider', async () => {
    const module = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    expect(module.get(PAYMENT_PROVIDER)).toBeDefined();
  });
});
