import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { StripeProvider } from '../../src/modules/billing/payment/stripe.provider';
import { BillingWebhookService } from '../../src/modules/billing/webhooks/billing-webhook.service';
import { PrismaService } from '../../src/prisma/prisma.service';

@Controller('test-harness')
class TestHarnessController {
  @Get('unprotected')
  unprotected(): { ok: boolean } {
    return { ok: true };
  }
}

export interface TestAppContext {
  app: INestApplication;
  prisma: PrismaService;
}

export async function createTestApp(): Promise<TestAppContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [TestHarnessController],
  })
    .overrideProvider(StripeProvider)
    .useValue({
      createCheckoutSession: jest.fn(),
      createCustomerPortalSession: jest.fn(),
    })
    .overrideProvider(BillingWebhookService)
    .useValue({
      handleStripeWebhook: jest.fn(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}

export function apiPath(path: string): string {
  return `/api/v1${path}`;
}
