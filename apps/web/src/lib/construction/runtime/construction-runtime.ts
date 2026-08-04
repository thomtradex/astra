import { ProjectHealthEngine } from "../project-health-engine";
import { DelayRiskEngine } from "../delay-risk-engine";
import { CostOverrunPredictor } from "../cost-overrun-predictor";
import { ConstructionIntelligenceEngine } from "../core/construction-intelligence-engine";

export class ConstructionRuntime {
  constructor(
    public health = ProjectHealthEngine,
    public delays = DelayRiskEngine,
    public costs = CostOverrunPredictor,
    public intelligence = new ConstructionIntelligenceEngine()
  ) {}
}
