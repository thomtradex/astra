export function forecastCompletion(progress: number, efficiency: number) {
  return Math.min(100, Math.round(progress * 0.6 + efficiency * 0.4));
}
