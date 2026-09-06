import { Injectable } from '@nestjs/common';

import {
  OrganizationUsage,
  UsageWarning,
} from './usage.types';


@Injectable()
export class UsageService {


  analyze(
    usage: OrganizationUsage,
    limits: {
      maxUsers:number;
      maxSites:number;
      maxAssets:number;
      maxWorkOrdersPerMonth:number;
    },
  ): UsageWarning[] {


    const warnings: UsageWarning[] = [];


    const checks = [

      {
        metric:'USERS' as const,
        value: usage.users,
        limit: limits.maxUsers,
      },

      {
        metric:'SITES' as const,
        value: usage.sites,
        limit: limits.maxSites,
      },

      {
        metric:'ASSETS' as const,
        value: usage.assets,
        limit: limits.maxAssets,
      },

      {
        metric:'WORK_ORDERS' as const,
        value: usage.workOrdersThisMonth,
        limit: limits.maxWorkOrdersPerMonth,
      },

    ];


    for (const check of checks) {


      if (check.limit === Infinity) {
        continue;
      }


      const percentage =
        Math.round(
          (check.value / check.limit) * 100,
        );


      if (percentage >= 80) {

        warnings.push({

          metric: check.metric,

          percentageUsed: percentage,

          message:
            `A utilização de ${check.metric} está em ${percentage}% da capacidade do plano.`,

        });

      }

    }


    return warnings;

  }

}
