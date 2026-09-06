import { Injectable } from '@nestjs/common';
import { AstraPlan, PLAN_LIMITS } from './plan.types';

@Injectable()
export class PlanService {

  getLimits(plan: AstraPlan) {
    return PLAN_LIMITS[plan];
  }

  canUseCOO(plan: AstraPlan): boolean {
    return PLAN_LIMITS[plan].cooActionsEnabled;
  }

  canUseIntelligence(plan: AstraPlan): boolean {
    return PLAN_LIMITS[plan].intelligenceEnabled;
  }

  canUseAdvancedReporting(plan: AstraPlan): boolean {
    return PLAN_LIMITS[plan].advancedReportingEnabled;
  }
}
