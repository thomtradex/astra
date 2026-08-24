export function calculateOperationalScore(availability: number, efficiency: number, risk: number) {
  return Math.round(availability * 0.4 + efficiency * 0.4 + (100 - risk) * 0.2);
}
