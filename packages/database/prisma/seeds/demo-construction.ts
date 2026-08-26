import crypto from 'crypto';

import { PrismaClient } from '@astra/database/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Astra construction demo data...');

  const organization = await prisma.organization.findUnique({
    where: {
      slug: 'astra-demo',
    },
  });

  if (!organization) {
    throw new Error('Astra demo organization not found');
  }

  const organizationId = organization.id;

  // CUSTOMERS
  const customers = await Promise.all([
    prisma.customers.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'CUST-001',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        code: 'CUST-001',
        name: 'Construções Horizonte Lda',
        email: 'geral@horizonte.pt',
        phone: '+351910000001',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
    prisma.customers.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'CUST-002',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        code: 'CUST-002',
        name: 'Engenharia Atlântica SA',
        email: 'contacto@atlantica.pt',
        phone: '+351910000002',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
    prisma.customers.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'CUST-003',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        code: 'CUST-003',
        name: 'Grupo Industrial Norte',
        email: 'info@gindustrial.pt',
        phone: '+351910000003',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
  ]);

  // SITES / OBRAS
  const sites = await Promise.all([
    prisma.sites.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'OBRA-001',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: 'Torre Residencial Lisboa',
        code: 'OBRA-001',
        address: 'Avenida Central',
        city: 'Lisboa',
        country: 'Portugal',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
    prisma.sites.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'OBRA-002',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: 'Parque Industrial Norte',
        code: 'OBRA-002',
        address: 'Zona Industrial Norte',
        city: 'Porto',
        country: 'Portugal',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
    prisma.sites.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: 'OBRA-003',
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: 'Centro Logístico Premium',
        code: 'OBRA-003',
        address: 'Área Empresarial',
        city: 'Braga',
        country: 'Portugal',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    }),
  ]);

  // ASSETS
  const assets = [];

  const assetData = [
    ['Grua Torre GT-500', 'AST-GRU-001'],
    ['Escavadora CAT 320', 'AST-ESC-001'],
    ['Gerador Industrial 500KW', 'AST-GER-001'],
    ['Betoneira ProMix', 'AST-BET-001'],
    ['Empilhador RX-20', 'AST-EMP-001'],
    ['Camião Basculante Volvo', 'AST-CAM-001'],
    ['Plataforma Elevatória', 'AST-PLA-001'],
  ];

  for (let i = 0; i < assetData.length; i++) {
    const asset = await prisma.assets.upsert({
      where: {
        organization_id_code: {
          organization_id: organizationId,
          code: assetData[i][1],
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: assetData[i][0],
        code: assetData[i][1],
        serial_number: `SERIAL-${1000 + i}`,
        description: `Equipamento utilizado em operações Astra Demo`,
        status: i === 5 ? 'MAINTENANCE' : 'ACTIVE',
        organization_id: organizationId,
        site_id: sites[i % sites.length].id,
        updated_at: new Date(),
      },
    });

    assets.push(asset);
  }

  // MAINTENANCE PLANS
  for (const asset of assets) {
    await prisma.maintenance_plans.create({
      data: {
        id: crypto.randomUUID(),
        plan: 'Manutenção preventiva mensal',
        assetId: asset.id,
        frequency: 'MONTHLY',
        nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        status: 'ACTIVE',
        organization_id: organizationId,
        updated_at: new Date(),
      },
    });
  }

  // WORK ORDERS
  const orders = [
    ['Inspeção da grua torre', 'HIGH'],
    ['Substituição de componentes hidráulicos', 'CRITICAL'],
    ['Revisão preventiva do gerador', 'MEDIUM'],
    ['Calibração da betoneira', 'LOW'],
    ['Manutenção do empilhador', 'HIGH'],
    ['Verificação de segurança da obra', 'MEDIUM'],
  ];

  for (let i = 0; i < orders.length; i++) {
    await prisma.work_orders.create({
      data: {
        id: crypto.randomUUID(),
        title: orders[i][0],
        description: 'Tarefa criada automaticamente para demonstração Astra.',
        status: i < 3 ? 'OPEN' : 'COMPLETED',
        priority: orders[i][1],
        organization_id: organizationId,
        asset_id: assets[i % assets.length].id,
        updated_at: new Date(),
      },
    });
  }

  console.log('Construction demo created successfully!');
  console.log(`Customers: ${customers.length}`);
  console.log(`Sites: ${sites.length}`);
  console.log(`Assets: ${assets.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
