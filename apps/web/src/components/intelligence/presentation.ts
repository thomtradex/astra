export function humanizeOperationalText(value: string): string {
  return value.replace(
    /(\d+)\s+dia\(s\)/g,
    (_, days: string) => `${days} ${Number(days) === 1 ? 'dia' : 'dias'}`,
  );
}
