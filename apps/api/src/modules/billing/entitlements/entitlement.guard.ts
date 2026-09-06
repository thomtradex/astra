import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { PlanService } from '../plans/plan.service';

@Injectable()
export class EntitlementGuard implements CanActivate {

  constructor(
    private readonly planService: PlanService,
  ) {}

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();

    const organization = request.user?.organization;

    if (!organization?.plan) {
      throw new ForbiddenException(
        'Plano da organização não encontrado.',
      );
    }

    const requiredFeature =
      request.requiredFeature;

    if (!requiredFeature) {
      return true;
    }

    let allowed = false;

    switch(requiredFeature) {

      case 'COO_ACTIONS':
        allowed =
          this.planService.canUseCOO(
            organization.plan,
          );
        break;

      case 'INTELLIGENCE':
        allowed =
          this.planService.canUseIntelligence(
            organization.plan,
          );
        break;

      case 'ADVANCED_REPORTING':
        allowed =
          this.planService.canUseAdvancedReporting(
            organization.plan,
          );
        break;

      default:
        allowed = false;
    }


    if (!allowed) {
      throw new ForbiddenException(
        'Esta funcionalidade não está disponível no seu plano atual.',
      );
    }


    return true;
  }
}
