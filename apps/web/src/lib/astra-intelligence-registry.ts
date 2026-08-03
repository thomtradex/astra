import { AstraMarketIntelligence } from "./astra-market-intelligence";
import { AstraAIGovernance } from "./astra-ai-governance";
import { AstraEnterpriseReadiness } from "./astra-enterprise-readiness";
import { AstraGlobalExpansion } from "./astra-global-expansion";
import { AstraProductAnalytics } from "./astra-product-analytics";
import { AstraAutomationEngine } from "./astra-automation-engine";
import { AstraDataIntelligence } from "./astra-data-intelligence";
import { AstraSecurityFramework } from "./astra-security-framework";

export const AstraIntelligenceRegistry = {
  market: AstraMarketIntelligence,
  aiGovernance: AstraAIGovernance,
  enterprise: AstraEnterpriseReadiness,
  expansion: AstraGlobalExpansion,
  analytics: AstraProductAnalytics,
  automation: AstraAutomationEngine,
  data: AstraDataIntelligence,
  security: AstraSecurityFramework,

  status: "operational",
};
