export function exportReport(data: unknown) {
  return JSON.stringify(data, null, 2);
}
