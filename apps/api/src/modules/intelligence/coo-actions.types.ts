import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CooActionVerification } from './intelligence.types';

export type CooAction =
  | {
      type: 'ASSIGN_WORK_ORDER';
      resource: 'work_orders';
      resourceId: string;
      input: {
        assignedToId: string;
      };
    }
  | {
      type: 'UPDATE_MAINTENANCE';
      resource: 'maintenance_plans';
      resourceId: string;
      input: {
        nextDue: string;
      };
    }
  | {
      type: 'SET_PROJECT_STATUS';
      resource: 'projects';
      resourceId: string;
      input: {
        status: 'ON_HOLD';
      };
    };

export interface CooActionOutcome {
  action: CooAction;
  allowed: boolean;
  status: 'EXECUTED' | 'DENIED' | 'FAILED';
  resourceId: string;
  message: string;
  verification?: CooActionVerification;
}

export interface CooActionExecutor {
  execute(user: AuthenticatedUser, action: CooAction): Promise<CooActionOutcome>;
}
