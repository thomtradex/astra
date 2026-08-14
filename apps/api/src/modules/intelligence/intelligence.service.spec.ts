import { Test, TestingModule } from '@nestjs/testing';

import { IntelligenceEngine } from './engines/intelligence.engine';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceService', () => {
  let service: IntelligenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntelligenceService, IntelligenceEngine],
    }).compile();

    service = module.get<IntelligenceService>(IntelligenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
