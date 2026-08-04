import { ProjectHealthEngine } from "../operations/project-health-engine";
import { DelayRiskEngine } from "../delay-risk-engine";
import { CostOverrunPredictor } from "../cost-overrun-predictor";
import { ConstructionIntelligenceEngine } from "../core/construction-intelligence-engine";

export class ConstructionRuntime {
  constructor(
    public health = new ProjectHealthEngine(),
    public delays = new DelayRiskEngine(),
    public costs = new CostOverrunPredictor(),
    public intelligence = new ConstructionIntelligenceEngine()
  ) {}
}
