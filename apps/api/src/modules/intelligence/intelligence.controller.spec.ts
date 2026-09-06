import { CooActionExecutorService } from './coo-action.executor';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceController', () => {
  it('should be defined', () => {
    const service = {} as IntelligenceService;
    const cooActionExecutor = {} as CooActionExecutorService;

    const controller = new IntelligenceController(
      service,
      cooActionExecutor,
    );

    expect(controller).toBeDefined();
  });
});
