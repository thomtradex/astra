import { AstraAdaptationEngine } from "./astra-adaptation-engine";
import { AstraAnalyticsEngine } from "./astra-analytics-engine";
import { AstraAuditEngine } from "./astra-audit-engine";
import { AstraAutomationEngine } from "./astra-automation-engine";
import { AstraAutonomousEngine } from "./astra-autonomous-engine";
import { AstraAutonomousEvolutionEngine } from "./astra-autonomous-evolution-engine";
import { AstraBackupEngine } from "./astra-backup-engine";
import { AstraBillingEngine } from "./astra-billing-engine";
import { AstraCapabilityEvolutionEngine } from "./astra-capability-evolution-engine";
import { AstraCausalEngine } from "./astra-causal-engine";
import { AstraCognitiveEngine } from "./astra-cognitive-engine";
import { AstraCollaborationEngine } from "./astra-collaboration-engine";
import { AstraCommercialEngine } from "./astra-commercial-engine";
import { AstraCommunicationEngine } from "./astra-communication-engine";
import { AstraComplianceEngine } from "./astra-compliance-engine";
import { AstraConsensusEngine } from "./astra-consensus-engine";
import { AstraContextEngine } from "./astra-context-engine";
import { AstraCoordinationEngine } from "./astra-coordination-engine";
import { AstraCopilotEngine } from "./astra-copilot-engine";
import { AstraCryptoEngine } from "./astra-crypto-engine";
import { AstraDashboardEngine } from "./astra-dashboard-engine";
import { AstraDecisionEngine } from "./astra-decision-engine";
import { AstraDiagnosticsEngine } from "./astra-diagnostics-engine";
import { AstraDistributionEngine } from "./astra-distribution-engine";
import { AstraEfficiencyEngine } from "./astra-efficiency-engine";
import { AstraEmailEngine } from "./astra-email-engine";
import { AstraEngineLoader } from "./astra-engine-loader";
import { AstraEngineManager } from "./astra-engine-manager";
import { AstraEngineRegistry } from "./astra-engine-registry";
import { AstraEngineSupervisor } from "./astra-engine-supervisor";
import { AstraEvaluationEngine } from "./astra-evaluation-engine";
import { AstraEvolutionEngine } from "./astra-evolution-engine";
import { AstraExecutionEngine } from "./astra-execution-engine";
import { AstraExecutiveDecisionEngine } from "./astra-executive-decision-engine";
import { AstraExtensionEngine } from "./astra-extension-engine";
import { AstraFeedbackEngine } from "./astra-feedback-engine";
import { AstraGoalEngine } from "./astra-goal-engine";
import { AstraGovernanceEngine } from "./astra-governance-engine";
import { AstraInferenceEngine } from "./astra-inference-engine";
import { AstraInsightEngine } from "./astra-insight-engine";
import { AstraInsightsEngine } from "./astra-insights-engine";
import { AstraIntentEngine } from "./astra-intent-engine";
import { AstraIntrospectionEngine } from "./astra-introspection-engine";
import { AstraKnowledgeEngine } from "./astra-knowledge-engine";
import { AstraKpiEngine } from "./astra-kpi-engine";
import { AstraLearningEngine } from "./astra-learning-engine";
import { AstraLicenseEngine } from "./astra-license-engine";
import { AstraMemoryEngine } from "./astra-memory-engine";
import { AstraMetaReasoningEngine } from "./astra-meta-reasoning-engine";
import { AstraMetacognitionEngine } from "./astra-metacognition-engine";
import { AstraMetricsEngine } from "./astra-metrics-engine";
import { AstraMigrationEngine } from "./astra-migration-engine";
import { AstraMultiAgentEngine } from "./astra-multi-agent-engine";
import { AstraNotificationEngine } from "./astra-notification-engine";
import { AstraObjectiveEngine } from "./astra-objective-engine";
import { AstraObservabilityEngine } from "./astra-observability-engine";
import { AstraOptimizationEngine } from "./astra-optimization-engine";
import { AstraOrchestrationEngine } from "./astra-orchestration-engine";
import { AstraPatternEngine } from "./astra-pattern-engine";
import { AstraPerceptionEngine } from "./astra-perception-engine";
import { AstraPerformanceEngine } from "./astra-performance-engine";
import { AstraPlannerEngine } from "./astra-planner-engine";
import { AstraPlanningEngine } from "./astra-planning-engine";
import { AstraPolicyEngine } from "./astra-policy-engine";
import { AstraPredictionEngine } from "./astra-prediction-engine";
import { AstraPredictiveEngine } from "./astra-predictive-engine";
import { AstraPriorityEngine } from "./astra-priority-engine";
import { AstraProcessEngine } from "./astra-process-engine";
import { AstraPromptEngine } from "./astra-prompt-engine";
import { AstraRagEngine } from "./astra-rag-engine";
import { AstraReasoningEngine } from "./astra-reasoning-engine";
import { AstraRecommendationEngine } from "./astra-recommendation-engine";
import { AstraRecoveryEngine } from "./astra-recovery-engine";
import { AstraReflectionEngine } from "./astra-reflection-engine";
import { AstraReplicationEngine } from "./astra-replication-engine";
import { AstraReportingEngine } from "./astra-reporting-engine";
import { AstraResilienceEngine } from "./astra-resilience-engine";
import { AstraRevenueEngine } from "./astra-revenue-engine";
import { AstraSelfAnalysisEngine } from "./astra-self-analysis-engine";
import { AstraSelfAwarenessEngine } from "./astra-self-awareness-engine";
import { AstraSelfHealingEngine } from "./astra-self-healing-engine";
import { AstraSelfImprovementEngine } from "./astra-self-improvement-engine";
import { AstraSelfOptimizationEngine } from "./astra-self-optimization-engine";
import { AstraSessionEngine } from "./astra-session-engine";
import { AstraSMSEngine } from "./astra-sms-engine";
import { AstraStrategyEngine } from "./astra-strategy-engine";
import { AstraSubscriptionEngine } from "./astra-subscription-engine";
import { AstraSynchronizationEngine } from "./astra-synchronization-engine";
import { AstraTaskEngine } from "./astra-task-engine";
import { AstraTelemetryEngine } from "./astra-telemetry-engine";
import { AstraThreatEngine } from "./astra-threat-engine";
import { AstraTriggerEngine } from "./astra-trigger-engine";
import { AstraWebhookEngine } from "./astra-webhook-engine";
import { AstraWorkflowEngine } from "./astra-workflow-engine";

export const EngineRegistry={
    "astra-adaptation-engine": AstraAdaptationEngine,
    "astra-analytics-engine": AstraAnalyticsEngine,
    "astra-audit-engine": AstraAuditEngine,
    "astra-automation-engine": AstraAutomationEngine,
    "astra-autonomous-engine": AstraAutonomousEngine,
    "astra-autonomous-evolution-engine": AstraAutonomousEvolutionEngine,
    "astra-backup-engine": AstraBackupEngine,
    "astra-billing-engine": AstraBillingEngine,
    "astra-capability-evolution-engine": AstraCapabilityEvolutionEngine,
    "astra-causal-engine": AstraCausalEngine,
    "astra-cognitive-engine": AstraCognitiveEngine,
    "astra-collaboration-engine": AstraCollaborationEngine,
    "astra-commercial-engine": AstraCommercialEngine,
    "astra-communication-engine": AstraCommunicationEngine,
    "astra-compliance-engine": AstraComplianceEngine,
    "astra-consensus-engine": AstraConsensusEngine,
    "astra-context-engine": AstraContextEngine,
    "astra-coordination-engine": AstraCoordinationEngine,
    "astra-copilot-engine": AstraCopilotEngine,
    "astra-crypto-engine": AstraCryptoEngine,
    "astra-dashboard-engine": AstraDashboardEngine,
    "astra-decision-engine": AstraDecisionEngine,
    "astra-diagnostics-engine": AstraDiagnosticsEngine,
    "astra-distribution-engine": AstraDistributionEngine,
    "astra-efficiency-engine": AstraEfficiencyEngine,
    "astra-email-engine": AstraEmailEngine,
    "astra-engine-loader": AstraEngineLoader,
    "astra-engine-manager": AstraEngineManager,
    "astra-engine-registry": AstraEngineRegistry,
    "astra-engine-supervisor": AstraEngineSupervisor,
    "astra-evaluation-engine": AstraEvaluationEngine,
    "astra-evolution-engine": AstraEvolutionEngine,
    "astra-execution-engine": AstraExecutionEngine,
    "astra-executive-decision-engine": AstraExecutiveDecisionEngine,
    "astra-extension-engine": AstraExtensionEngine,
    "astra-feedback-engine": AstraFeedbackEngine,
    "astra-goal-engine": AstraGoalEngine,
    "astra-governance-engine": AstraGovernanceEngine,
    "astra-inference-engine": AstraInferenceEngine,
    "astra-insight-engine": AstraInsightEngine,
    "astra-insights-engine": AstraInsightsEngine,
    "astra-intent-engine": AstraIntentEngine,
    "astra-introspection-engine": AstraIntrospectionEngine,
    "astra-knowledge-engine": AstraKnowledgeEngine,
    "astra-kpi-engine": AstraKpiEngine,
    "astra-learning-engine": AstraLearningEngine,
    "astra-license-engine": AstraLicenseEngine,
    "astra-memory-engine": AstraMemoryEngine,
    "astra-meta-reasoning-engine": AstraMetaReasoningEngine,
    "astra-metacognition-engine": AstraMetacognitionEngine,
    "astra-metrics-engine": AstraMetricsEngine,
    "astra-migration-engine": AstraMigrationEngine,
    "astra-multi-agent-engine": AstraMultiAgentEngine,
    "astra-notification-engine": AstraNotificationEngine,
    "astra-objective-engine": AstraObjectiveEngine,
    "astra-observability-engine": AstraObservabilityEngine,
    "astra-optimization-engine": AstraOptimizationEngine,
    "astra-orchestration-engine": AstraOrchestrationEngine,
    "astra-pattern-engine": AstraPatternEngine,
    "astra-perception-engine": AstraPerceptionEngine,
    "astra-performance-engine": AstraPerformanceEngine,
    "astra-planner-engine": AstraPlannerEngine,
    "astra-planning-engine": AstraPlanningEngine,
    "astra-policy-engine": AstraPolicyEngine,
    "astra-prediction-engine": AstraPredictionEngine,
    "astra-predictive-engine": AstraPredictiveEngine,
    "astra-priority-engine": AstraPriorityEngine,
    "astra-process-engine": AstraProcessEngine,
    "astra-prompt-engine": AstraPromptEngine,
    "astra-rag-engine": AstraRagEngine,
    "astra-reasoning-engine": AstraReasoningEngine,
    "astra-recommendation-engine": AstraRecommendationEngine,
    "astra-recovery-engine": AstraRecoveryEngine,
    "astra-reflection-engine": AstraReflectionEngine,
    "astra-replication-engine": AstraReplicationEngine,
    "astra-reporting-engine": AstraReportingEngine,
    "astra-resilience-engine": AstraResilienceEngine,
    "astra-revenue-engine": AstraRevenueEngine,
    "astra-self-analysis-engine": AstraSelfAnalysisEngine,
    "astra-self-awareness-engine": AstraSelfAwarenessEngine,
    "astra-self-healing-engine": AstraSelfHealingEngine,
    "astra-self-improvement-engine": AstraSelfImprovementEngine,
    "astra-self-optimization-engine": AstraSelfOptimizationEngine,
    "astra-session-engine": AstraSessionEngine,
    "astra-sms-engine": AstraSMSEngine,
    "astra-strategy-engine": AstraStrategyEngine,
    "astra-subscription-engine": AstraSubscriptionEngine,
    "astra-synchronization-engine": AstraSynchronizationEngine,
    "astra-task-engine": AstraTaskEngine,
    "astra-telemetry-engine": AstraTelemetryEngine,
    "astra-threat-engine": AstraThreatEngine,
    "astra-trigger-engine": AstraTriggerEngine,
    "astra-webhook-engine": AstraWebhookEngine,
    "astra-workflow-engine": AstraWorkflowEngine,
}
