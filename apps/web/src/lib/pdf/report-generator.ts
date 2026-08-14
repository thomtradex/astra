export function generateReport(data: unknown) {
  return {
    generatedAt: new Date().toISOString(),
    data,
  };
}
