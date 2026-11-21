import { MaintenanceDecisionAction } from '@/app/intelligence/maintenance-decision-action';
import { ProjectDecisionAction } from '@/app/intelligence/project-decision-action';
import { WorkOrderDecisionAction } from '@/app/intelligence/work-order-decision-action';
import type { IntelligenceSignal } from '@/lib/intelligence-client';

export function SignalAction({ action }: { action: IntelligenceSignal['action'] }) {
  if (!action) {
    return null;
  }

  if (action.type === 'ASSIGN_WORK_ORDER' && action.resource === 'work_orders') {
    return <WorkOrderDecisionAction workOrderId={action.resourceId} />;
  }

  if (action.type === 'UPDATE_MAINTENANCE' && action.resource === 'maintenance_plans') {
    return <MaintenanceDecisionAction maintenancePlanId={action.resourceId} />;
  }

  if (action.type === 'SET_PROJECT_STATUS' && action.resource === 'projects') {
    return <ProjectDecisionAction projectId={action.resourceId} />;
  }

  return null;
}
