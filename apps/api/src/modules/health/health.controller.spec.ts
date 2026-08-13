import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns ok when database is reachable', async () => {
    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.services.database).toBe('up');
  });

  it('returns degraded when database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.services.database).toBe('down');
  });
});
