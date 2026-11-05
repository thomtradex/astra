import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';

import { BillingWebhookService } from './billing-webhook.service';

describe('BillingWebhookService — Stripe inbox ingestion', () => {
  const prisma = {} as never;
  const webhookEvents = {
    register: jest.fn(),
  };

  let service: BillingWebhookService;

  const event = {
    id: 'evt_test_inbox_1',
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_test_1',
      },
    },
  } as Stripe.Event;

  const payload = Buffer.from(JSON.stringify(event));
  const signature = 'test_signature';

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_unit';

    webhookEvents.register.mockResolvedValue({
      stripeEventId: event.id,
    });

    service = new BillingWebhookService(
      prisma,
      webhookEvents as never,
    );

    const stripeClient = (
      service as unknown as {
        stripe: {
          webhooks: {
            constructEvent: jest.Mock;
          };
        };
      }
    ).stripe;

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue(event);
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('registers a verified event before acknowledging it', async () => {
    const result = await service.handleStripeWebhook(payload, signature);

    expect(webhookEvents.register).toHaveBeenCalledTimes(1);
    expect(webhookEvents.register).toHaveBeenCalledWith(event);
    expect(result).toEqual({ received: true });
  });

  it('does not register events when signature verification fails', async () => {
    const stripeClient = (
      service as unknown as {
        stripe: {
          webhooks: {
            constructEvent: jest.Mock;
          };
        };
      }
    ).stripe;

    stripeClient.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await expect(
      service.handleStripeWebhook(payload, signature),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(webhookEvents.register).not.toHaveBeenCalled();
  });

  it('does not acknowledge an event when persistence fails', async () => {
    webhookEvents.register.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    await expect(
      service.handleStripeWebhook(payload, signature),
    ).rejects.toThrow('Database unavailable');

    expect(webhookEvents.register).toHaveBeenCalledTimes(1);
  });

  it('rejects ingestion when the inbox dependency is missing', async () => {
    const withoutInbox = new BillingWebhookService(prisma);

    const stripeClient = (
      withoutInbox as unknown as {
        stripe: {
          webhooks: {
            constructEvent: jest.Mock;
          };
        };
      }
    ).stripe;

    stripeClient.webhooks.constructEvent = jest.fn().mockReturnValue(event);

    await expect(
      withoutInbox.handleStripeWebhook(payload, signature),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(webhookEvents.register).not.toHaveBeenCalled();
  });
});
