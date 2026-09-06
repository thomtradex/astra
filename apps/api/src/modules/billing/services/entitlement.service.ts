import { Injectable, ForbiddenException } from '@nestjs/common';
import { PLAN_ENTITLEMENTS } from '../config/plan-entitlements';

@Injectable()
export class EntitlementService {

  getPlan(planCode: string) {
    return (
      PLAN_ENTITLEMENTS[
        planCode as keyof typeof PLAN_ENTITLEMENTS
      ] ?? PLAN_ENTITLEMENTS.FREE
    );
  }


  hasFeature(
    planCode:string,
    feature:string,
  ) {

    const plan = this.getPlan(planCode);

    return plan.features.includes(
      feature as never,
    );
  }


  checkFeature(
    planCode:string,
    feature:string,
  ) {

    if(!this.hasFeature(planCode, feature)) {

      throw new ForbiddenException(
        `Feature ${feature} requires a higher plan`
      );
    }

    return true;
  }


  checkLimit(
    planCode:string,
    resource:keyof typeof PLAN_ENTITLEMENTS.FREE,
    current:number,
  ){

    const plan:any = this.getPlan(planCode);

    const limit = plan[resource];

    if(limit === -1) {
      return true;
    }


    if(current >= limit){

      throw new ForbiddenException(
        `${resource} limit reached for ${planCode}`
      );
    }

    return true;
  }
}
