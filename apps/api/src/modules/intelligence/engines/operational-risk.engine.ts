import { Injectable } from '@nestjs/common';

export type OperationalRiskInput = {
  priority?: string;
  status?: string;
  assigned?: boolean;
  ageDays?: number;
  relatedOpenWorkOrders?: number;
  projectOverdueDays?: number;
  maintenanceOverdueDays?: number;
};

export type OperationalRiskResult = {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
};

@Injectable()
export class OperationalRiskEngine {
  calculate(input: OperationalRiskInput): OperationalRiskResult {
    let score = 0;
    const factors: string[] = [];

    if (input.priority === 'CRITICAL') {
      score += 40;
      factors.push('Prioridade CRITICAL');
    } else if (input.priority === 'HIGH') {
      score += 30;
      factors.push('Prioridade HIGH');
    } else if (input.priority === 'MEDIUM') {
      score += 15;
      factors.push('Prioridade MEDIUM');
    }

    if (input.status === 'OPEN') {
      score += 5;
      factors.push('Estado OPEN');
    }

    if (input.assigned === false) {
      score += 20;
      factors.push('Sem responsável');
    }

    if ((input.ageDays ?? 0) >= 7) {
      score += 20;
      factors.push(`Sem atualização há ${input.ageDays} dia(s)`);
    } else if ((input.ageDays ?? 0) >= 3) {
      score += 10;
      factors.push(`Sem atualização há ${input.ageDays} dia(s)`);
    }

    if ((input.relatedOpenWorkOrders ?? 0) >= 3) {
      score += 10;
      factors.push(
        `${input.relatedOpenWorkOrders} ordens abertas relacionadas`,
      );
    } else if ((input.relatedOpenWorkOrders ?? 0) > 0) {
      score += 5;
      factors.push(
        `${input.relatedOpenWorkOrders} ordem(ns) aberta(s) relacionada(s)`,
      );
    }

    if ((input.projectOverdueDays ?? 0) > 0) {
      score += 15;
      factors.push(
        `Obra em atraso há ${input.projectOverdueDays} dia(s)`,
      );
    }

    if ((input.maintenanceOverdueDays ?? 0) > 0) {
      score += 15;
      factors.push(
        `Manutenção em atraso há ${input.maintenanceOverdueDays} dia(s)`,
      );
    }

    score = Math.min(100, score);

    const level =
      score >= 85
        ? 'CRITICAL'
        : score >= 65
          ? 'HIGH'
          : score >= 40
            ? 'MEDIUM'
            : 'LOW';

    return {
      score,
      level,
      factors,
    };
  }
}
