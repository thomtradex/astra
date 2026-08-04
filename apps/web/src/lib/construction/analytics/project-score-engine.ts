export interface ProjectScore {
  overall: number;
  cost: number;
  schedule: number;
  quality: number;
  safety: number;
}

export function calculateProjectScore(): ProjectScore {
  return {
    overall: 0,
    cost: 0,
    schedule: 0,
    quality: 0,
    safety: 0,
  };
}
