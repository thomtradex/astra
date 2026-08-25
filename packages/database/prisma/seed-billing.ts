import { PrismaClient } from '@astra/database/client';

const prisma = new PrismaClient();

type BillingPlanSeed = {
  code: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  currency: string;
  trialDays: number;
  displayOrder: number;
  limits: Record<string, number | string>;
  features: Record<string, boolean | string>;
};

const PLANS: BillingPlanSeed[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    description:
      'Para pequenas empresas de construção que precisam de centralização operacional, controlo de ativos e gestão de manutenção.',
    monthlyPriceCents: 9900,
    currency: 'EUR',
    trialDays: 14,
    displayOrder: 1,

    limits: {
      users: 5,
      sites: 3,
      customers: 100,
      assets: 250,
      workOrdersPerMonth: 500,
      maintenancePlans: 100,
      aiRequestsPerMonth: 100,
      reportsPerMonth: 25,
      storageGb: 5,
    },

    features: {
      dashboard: true,
      customerManagement: true,
      siteManagement: true,
      assetManagement: true,
      workOrderManagement: true,
      maintenanceManagement: true,
      basicReports: true,
      aiAssistant: true,
      forecasting: false,
      intelligence: false,
      advancedAnalytics: false,
      apiAccess: false,
      auditLogs: true,
      customRoles: false,
      prioritySupport: false,
      dedicatedSupport: false,
      multiSiteOperations: true,
      advancedAutomation: false,
    },
  },

  {
    code: 'PROFESSIONAL',
    name: 'Professional',
    description:
      'Para empresas de construção em crescimento que precisam de operações mais avançadas, automação e inteligência para tomar melhores decisões.',
    monthlyPriceCents: 24900,
    currency: 'EUR',
    trialDays: 14,
    displayOrder: 2,

    limits: {
      users: 20,
      sites: 15,
      customers: 1000,
      assets: 2500,
      workOrdersPerMonth: 5000,
      maintenancePlans: 1000,
      aiRequestsPerMonth: 1000,
      reportsPerMonth: 250,
      storageGb: 50,
    },

    features: {
      dashboard: true,
      customerManagement: true,
      siteManagement: true,
      assetManagement: true,
      workOrderManagement: true,
      maintenanceManagement: true,
      basicReports: true,
      aiAssistant: true,
      forecasting: true,
      intelligence: true,
      advancedAnalytics: true,
      apiAccess: true,
      auditLogs: true,
      customRoles: true,
      prioritySupport: true,
      dedicatedSupport: false,
      multiSiteOperations: true,
      advancedAutomation: true,
    },
  },

  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    description:
      'Para organizações de construção com operações complexas, múltiplas equipas e necessidade de máxima escala, controlo e inteligência operacional.',
    monthlyPriceCents: 59900,
    currency: 'EUR',
    trialDays: 14,
    displayOrder: 3,

    limits: {
      users: 100,
      sites: 100,
      customers: 10000,
      assets: 25000,
      workOrdersPerMonth: 25000,
      maintenancePlans: 10000,
      aiRequestsPerMonth: 10000,
      reportsPerMonth: 2500,
      storageGb: 250,
    },

    features: {
      dashboard: true,
      customerManagement: true,
      siteManagement: true,
      assetManagement: true,
      workOrderManagement: true,
      maintenanceManagement: true,
      basicReports: true,
      aiAssistant: true,
      forecasting: true,
      intelligence: true,
      advancedAnalytics: true,
      apiAccess: true,
      auditLogs: true,
      customRoles: true,
      prioritySupport: true,
      dedicatedSupport: true,
      multiSiteOperations: true,
      advancedAutomation: true,
      enterpriseSecurity: true,
      advancedIntegrations: true,
      customWorkflows: true,
    },
  },
];

async function seedBillingPlans(): Promise<void> {
  console.info('Seeding professional billing plans...');

  for (const plan of PLANS) {
    const record = await prisma.billingPlan.upsert({
      where: {
        code: plan.code,
      },
      update: {
        name: plan.name,
        description: plan.description,
        monthlyPriceCents: plan.monthlyPriceCents,
        currency: plan.currency,
        trialDays: plan.trialDays,
        limits: plan.limits,
        features: plan.features,
        displayOrder: plan.displayOrder,
        isActive: true,
      },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        monthlyPriceCents: plan.monthlyPriceCents,
        currency: plan.currency,
        trialDays: plan.trialDays,
        limits: plan.limits,
        features: plan.features,
        displayOrder: plan.displayOrder,
        isActive: true,
      },
    });

    console.info(`  ${record.code}: €${(record.monthlyPriceCents / 100).toFixed(2)}/month`);
  }
}

async function main(): Promise<void> {
  await seedBillingPlans();

  console.info('');
  console.info('Billing plan seed completed.');
  console.info('Plans: STARTER / PROFESSIONAL / ENTERPRISE');
  console.info('Trial: 14 days');
}

main()
  .catch((error: unknown) => {
    console.error('Billing seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
