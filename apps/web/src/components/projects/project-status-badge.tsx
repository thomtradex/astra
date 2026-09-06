import type { ProjectStatus } from '@/lib/projects';

const labels: Record<ProjectStatus, string> = {
  PLANNING: 'Planeamento',
  ACTIVE: 'Em curso',
  ON_HOLD: 'Em pausa',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export function ProjectStatusBadge({
  status,
}: {
  status: ProjectStatus;
}) {
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {labels[status]}
    </span>
  );
}
