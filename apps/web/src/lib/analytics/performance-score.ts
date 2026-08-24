export function performanceScore(efficiency: number, availability: number, safety: number) {
  return Math.round(efficiency * 0.4 + availability * 0.4 + safety * 0.2);
}
