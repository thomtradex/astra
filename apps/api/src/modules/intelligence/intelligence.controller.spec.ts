import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceController', () => {
  it('should be defined', () => {
    const service = {} as IntelligenceService;

    const controller = new IntelligenceController(service);

    expect(controller).toBeDefined();
  });
});
