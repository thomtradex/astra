import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

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
      type: 'UPDATE_WORK_ORDER';
      resource: 'work_orders';
      resourceId: string;
      input: {
        status?: string;
        priority?: string;
      };
    };

export interface CooActionOutcome {
  action: CooAction;
  allowed: boolean;
  status: 'EXECUTED' | 'DENIED' | 'FAILED';
  resourceId: string;
  message: string;
}

export interface CooActionExecutor {
  execute(
    user: AuthenticatedUser,
    action: CooAction,
  ): Promise<CooActionOutcome>;
}
