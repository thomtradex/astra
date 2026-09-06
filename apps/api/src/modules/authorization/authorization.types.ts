import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

export type AuthorizationDecision =
  | {
      allowed: true;
      policy: string;
      reason: string;
      requiredPermissions: string[];
    }
  | {
      allowed: false;
      policy: string;
      reason: string;
      requiredPermissions: string[];
    };

export interface AuthorizationContext {
  user: AuthenticatedUser;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthorizationPolicy {
  readonly name: string;
  readonly requiredPermissions: readonly string[];

  evaluate(context: AuthorizationContext): AuthorizationDecision;
}
