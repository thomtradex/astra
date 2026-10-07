import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import { login, seedIntegrationTestData } from '../helpers/test-data';

describe('Procurement (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let organizationId: string;
  let otherOrganizationId: string;
  let alphaAdminToken: string;
  let alphaViewerToken: string;

  beforeAll(async () => {
    const context = await createTestApp();

    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);

    organizationId = seed.organizationId;
    otherOrganizationId = seed.otherOrganizationId;

    alphaAdminToken = (await login(app, 'admin@alpha.test')).accessToken;

    alphaViewerToken = (await login(app, 'viewer@alpha.test')).accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function setProcurementPlan(code: string, procurementManagement: boolean) {
    const now = new Date();

    const plan = await prisma.billingPlan.upsert({
      where: { code },
      update: {
        isActive: true,
        features: {
          intelligence: true,
          siteManagement: true,
          workOrderManagement: true,
          procurementManagement,
        },
        limits: {},
      },
      create: {
        code,
        name: code,
        description: 'Procurement integration test',
        monthlyPriceCents: 0,
        currency: 'EUR',
        trialDays: 0,
        isActive: true,
        displayOrder: 999,
        features: {
          intelligence: true,
          siteManagement: true,
          workOrderManagement: true,
          procurementManagement,
        },
        limits: {},
      },
    });

    await prisma.subscription.deleteMany({
      where: {
        organizationId,
      },
    });

    await prisma.subscription.create({
      data: {
        organizationId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: new Date('2099-12-31T23:59:59.999Z'),
        cancelAtPeriodEnd: false,
      },
    });
  }

  async function createAlphaSite() {
    const response = await apiRequest(app)
      .post(apiPath('/sites'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .send({
        name: `Alpha Procurement Site ${crypto.randomUUID()}`,
        code: `PROC-${crypto.randomUUID().slice(0, 8)}`,
      })
      .expect(201);

    return bodyOf<{
      id: string;
      organization_id: string;
    }>(response);
  }

  async function createAlphaMaterial() {
    const response = await apiRequest(app)
      .post(apiPath('/materials'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .send({
        code: `MAT-${crypto.randomUUID().slice(0, 8)}`,
        name: 'Integration Cement',
        unit: 'KG',
      })
      .expect(201);

    return bodyOf<{
      id: string;
      organization_id: string;
    }>(response);
  }

  async function createAlphaWorkOrder() {
    const response = await apiRequest(app)
      .post(apiPath('/work-orders'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .send({
        title: 'Procurement Integration Work Order',
        description: 'Procurement integration test',
        priority: 'HIGH',
      })
      .expect(201);

    return bodyOf<{
      id: string;
      organization_id: string;
    }>(response);
  }

  describe('authentication and authorization', () => {
    beforeEach(async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_ENABLED_${crypto.randomUUID()}`, true);
    });

    it('allows an authenticated admin to access inventory', async () => {
      await apiRequest(app)
        .get(apiPath('/inventory'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);
    });

    it('allows an authenticated admin to access materials', async () => {
      await apiRequest(app)
        .get(apiPath('/materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);
    });

    it('denies an unauthenticated procurement request', async () => {
      await apiRequest(app).get(apiPath('/inventory')).expect(401);
    });

    it('denies a viewer from managing materials', async () => {
      await apiRequest(app)
        .post(apiPath('/materials'))
        .set('Authorization', `Bearer ${alphaViewerToken}`)
        .send({
          code: `VIEWER-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Forbidden Material',
          unit: 'KG',
        })
        .expect(403);
    });

    it('blocks procurement when the organization plan does not include it', async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_DISABLED_${crypto.randomUUID()}`, false);

      await apiRequest(app)
        .get(apiPath('/inventory'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(400);
    });
  });

  describe('inventory lifecycle', () => {
    beforeEach(async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_INVENTORY_${crypto.randomUUID()}`, true);
    });

    it('creates a material, site, and inventory movement through HTTP', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();

      const response = await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: site.id,
          materialId: material.id,
          movementType: 'RECEIPT',
          quantity: 100,
          reason: 'Initial integration stock',
        })
        .expect(201);

      const movement = bodyOf<{
        organization_id: string;
        site_id: string;
        material_id: string;
        movement_type: string;
        quantity: string | number;
      }>(response);

      expect(movement.organization_id).toBe(organizationId);
      expect(movement.site_id).toBe(site.id);
      expect(movement.material_id).toBe(material.id);
      expect(movement.movement_type).toBe('RECEIPT');
      expect(Number(movement.quantity)).toBe(100);

      const stock = await prisma.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(stock).not.toBeNull();
      expect(Number(stock?.quantity_on_hand)).toBe(100);
      expect(Number(stock?.quantity_reserved)).toBe(0);
    });

    it('preserves concurrent inventory movements on the same stock row', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();

      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: site.id,
          materialId: material.id,
          movementType: 'RECEIPT',
          quantity: 100,
          reason: 'Concurrent movement baseline',
        })
        .expect(201);

      const [firstMovement, secondMovement] = await Promise.all([
        apiRequest(app)
          .post(apiPath('/inventory/movements'))
          .set('Authorization', `Bearer ${alphaAdminToken}`)
          .send({
            siteId: site.id,
            materialId: material.id,
            movementType: 'RECEIPT',
            quantity: 10,
            reason: 'Concurrent receipt A',
          }),
        apiRequest(app)
          .post(apiPath('/inventory/movements'))
          .set('Authorization', `Bearer ${alphaAdminToken}`)
          .send({
            siteId: site.id,
            materialId: material.id,
            movementType: 'RECEIPT',
            quantity: 5,
            reason: 'Concurrent receipt B',
          }),
      ]);

      expect(firstMovement.status).toBe(201);
      expect(secondMovement.status).toBe(201);

      const stock = await prisma.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(stock).not.toBeNull();
      expect(Number(stock?.quantity_on_hand)).toBe(115);

      const movements = await prisma.inventory_movements.findMany({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
        orderBy: {
          occurred_at: 'asc',
        },
      });

      expect(movements).toHaveLength(3);
      expect(
        movements
          .filter((movement) => movement.movement_type === 'RECEIPT')
          .reduce((total, movement) => total + Number(movement.quantity), 0),
      ).toBe(115);
    });

    it('rejects an invalid inventory movement payload', async () => {
      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: 'not-a-uuid',
          materialId: 'not-a-uuid',
          movementType: 'INVALID',
          quantity: 0,
        })
        .expect(400);
    });

    it('rejects CONSUMPTION through the generic inventory movement endpoint', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();

      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: site.id,
          materialId: material.id,
          movementType: 'CONSUMPTION',
          quantity: 5,
        })
        .expect(400);

      const stock = await prisma.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(stock).toBeNull();

      const movements = await prisma.inventory_movements.findMany({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(movements).toHaveLength(0);
    });
  });

  describe('work order material lifecycle', () => {
    beforeEach(async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_WORK_ORDER_${crypto.randomUUID()}`, true);
    });

    it('creates, reserves, and consumes a work order material through HTTP', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();
      const workOrder = await createAlphaWorkOrder();

      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: site.id,
          materialId: material.id,
          movementType: 'RECEIPT',
          quantity: 100,
          reason: 'Work order material integration stock',
        })
        .expect(201);

      const materialResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: workOrder.id,
          materialId: material.id,
          siteId: site.id,
          requiredQuantity: 40,
        })
        .expect(201);

      const workOrderMaterial = bodyOf<{
        id: string;
        organization_id: string;
        required_quantity: string | number;
        reserved_quantity: string | number;
        consumed_quantity: string | number;
        status: string;
      }>(materialResponse);

      expect(workOrderMaterial.organization_id).toBe(organizationId);
      expect(Number(workOrderMaterial.required_quantity)).toBe(40);
      expect(Number(workOrderMaterial.reserved_quantity)).toBe(0);
      expect(Number(workOrderMaterial.consumed_quantity)).toBe(0);
      expect(workOrderMaterial.status).toBe('REQUIRED');

      const reserveResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials/reserve'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderMaterialId: workOrderMaterial.id,
          quantity: 40,
        })
        .expect(201);

      const reserved = bodyOf<{
        reserved_quantity: string | number;
        consumed_quantity: string | number;
        status: string;
      }>(reserveResponse);

      expect(Number(reserved.reserved_quantity)).toBe(40);
      expect(Number(reserved.consumed_quantity)).toBe(0);
      expect(reserved.status).toBe('RESERVED');

      const consumeResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials/consume'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderMaterialId: workOrderMaterial.id,
          quantity: 40,
        })
        .expect(201);

      const consumed = bodyOf<{
        id: string;
        organization_id: string;
        reserved_quantity: string | number;
        consumed_quantity: string | number;
        status: string;
      }>(consumeResponse);

      expect(consumed.id).toBe(workOrderMaterial.id);
      expect(consumed.organization_id).toBe(organizationId);
      expect(Number(consumed.reserved_quantity)).toBe(0);
      expect(Number(consumed.consumed_quantity)).toBe(40);
      expect(consumed.status).toBe('CONSUMED');

      const stock = await prisma.inventory_stock.findFirstOrThrow({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(Number(stock.quantity_on_hand)).toBe(60);
      expect(Number(stock.quantity_reserved)).toBe(0);

      const movement = await prisma.inventory_movements.findFirst({
        where: {
          organization_id: organizationId,
          reference_type: 'WORK_ORDER_MATERIAL',
          reference_id: workOrderMaterial.id,
          movement_type: 'CONSUMPTION',
        },
      });

      expect(movement).not.toBeNull();
      expect(movement?.site_id).toBe(site.id);
      expect(movement?.material_id).toBe(material.id);
      expect(Number(movement?.quantity)).toBe(40);
    });

    it('preserves work order material consumption under concurrency', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();
      const workOrder = await createAlphaWorkOrder();

      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: site.id,
          materialId: material.id,
          movementType: 'RECEIPT',
          quantity: 100,
          reason: 'Concurrent consumption test stock',
        })
        .expect(201);

      const materialResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: workOrder.id,
          materialId: material.id,
          siteId: site.id,
          requiredQuantity: 40,
        })
        .expect(201);

      const workOrderMaterial = bodyOf<{
        id: string;
        reserved_quantity: string | number;
        consumed_quantity: string | number;
        status: string;
      }>(materialResponse);

      await apiRequest(app)
        .post(apiPath('/work-order-materials/reserve'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderMaterialId: workOrderMaterial.id,
          quantity: 40,
        })
        .expect(201);

      const results = await Promise.allSettled([
        apiRequest(app)
          .post(apiPath('/work-order-materials/consume'))
          .set('Authorization', `Bearer ${alphaAdminToken}`)
          .send({
            workOrderMaterialId: workOrderMaterial.id,
            quantity: 25,
          })
          .expect(201),

        apiRequest(app)
          .post(apiPath('/work-order-materials/consume'))
          .set('Authorization', `Bearer ${alphaAdminToken}`)
          .send({
            workOrderMaterialId: workOrderMaterial.id,
            quantity: 20,
          })
          .expect(201),
      ]);

      const successful = results.filter(
        (result): result is Extract<(typeof results)[number], { status: 'fulfilled' }> =>
          result.status === 'fulfilled',
      );
      const rejected = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );

      expect(successful).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const successfulResponse = successful[0]!.value as unknown as { body: unknown };

      const successfulBody = bodyOf<{
        reserved_quantity?: string | number;
        reservedQuantity?: string | number;
      }>(successfulResponse);

      const successfulQuantity = Number(
        successfulBody.reserved_quantity ?? successfulBody.reservedQuantity,
      );

      const rejectedReason: unknown = rejected[0]?.reason;

      expect(successfulQuantity).toBeDefined();
      expect([15, 20]).toContain(successfulQuantity);
      expect(rejectedReason).toBeDefined();

      const remainingReserved = successfulQuantity;
      const consumedQuantity = 40 - remainingReserved;

      const stock = await prisma.inventory_stock.findFirstOrThrow({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
        },
      });

      expect(Number(stock.quantity_on_hand)).toBe(100 - consumedQuantity);
      expect(Number(stock.quantity_reserved)).toBe(remainingReserved);

      const finalMaterial = await prisma.work_order_materials.findFirstOrThrow({
        where: {
          id: workOrderMaterial.id,
          organization_id: organizationId,
        },
      });

      expect(Number(finalMaterial.required_quantity)).toBe(40);
      expect(Number(finalMaterial.reserved_quantity)).toBe(remainingReserved);
      expect(Number(finalMaterial.consumed_quantity)).toBe(consumedQuantity);
      expect(finalMaterial.status).toBe('RESERVED');

      const movements = await prisma.inventory_movements.findMany({
        where: {
          organization_id: organizationId,
          site_id: site.id,
          material_id: material.id,
          reference_type: 'WORK_ORDER_MATERIAL',
          reference_id: workOrderMaterial.id,
          movement_type: 'CONSUMPTION',
        },
      });

      expect(movements).toHaveLength(1);
      expect(Number(movements[0]?.quantity)).toBe(consumedQuantity);
    });

    it('updates a work order material through HTTP', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();
      const workOrder = await createAlphaWorkOrder();

      const materialResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: workOrder.id,
          materialId: material.id,
          siteId: site.id,
          requiredQuantity: 40,
          notes: 'Original',
        })
        .expect(201);

      const workOrderMaterial = bodyOf<{
        id: string;
        required_quantity: string | number;
        notes?: string;
        status: string;
      }>(materialResponse);

      const updateResponse = await apiRequest(app)
        .patch(apiPath(`/work-order-materials/${workOrderMaterial.id}`))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          requiredQuantity: 60,
          notes: 'Updated through HTTP',
        })
        .expect(200);

      const updated = bodyOf<{
        id: string;
        required_quantity: string | number;
        notes?: string;
        status: string;
      }>(updateResponse);

      expect(updated.id).toBe(workOrderMaterial.id);
      expect(Number(updated.required_quantity)).toBe(60);
      expect(updated.notes).toBe('Updated through HTTP');
      expect(updated.status).toBe('REQUIRED');
    });

    it('rejects an invalid work order material update payload', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();
      const workOrder = await createAlphaWorkOrder();

      const materialResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: workOrder.id,
          materialId: material.id,
          siteId: site.id,
          requiredQuantity: 40,
        })
        .expect(201);

      const workOrderMaterial = bodyOf<{ id: string }>(materialResponse);

      await apiRequest(app)
        .patch(apiPath(`/work-order-materials/${workOrderMaterial.id}`))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          requiredQuantity: 0,
        })
        .expect(400);
    });

    it('rejects unknown fields in a work order material update payload', async () => {
      const site = await createAlphaSite();
      const material = await createAlphaMaterial();
      const workOrder = await createAlphaWorkOrder();

      const materialResponse = await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: workOrder.id,
          materialId: material.id,
          siteId: site.id,
          requiredQuantity: 40,
        })
        .expect(201);

      const workOrderMaterial = bodyOf<{ id: string }>(materialResponse);

      await apiRequest(app)
        .patch(apiPath(`/work-order-materials/${workOrderMaterial.id}`))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          requiredQuantity: 60,
          unexpectedField: 'must be rejected',
        })
        .expect(400);
    });

    it('rejects an invalid work order material payload', async () => {
      await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: 'not-a-uuid',
          materialId: 'not-a-uuid',
          siteId: 'not-a-uuid',
          requiredQuantity: 0,
        })
        .expect(400);
    });
  });

  describe('tenant isolation', () => {
    beforeEach(async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_TENANT_${crypto.randomUUID()}`, true);
    });

    it('does not expose another organization inventory', async () => {
      const betaSiteId = crypto.randomUUID();
      const betaMaterialId = crypto.randomUUID();

      await prisma.sites.create({
        data: {
          id: betaSiteId,
          name: 'Beta Procurement Site',
          code: `BETA-PROC-${crypto.randomUUID().slice(0, 8)}`,
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      await prisma.materials.create({
        data: {
          id: betaMaterialId,
          organization_id: otherOrganizationId,
          code: `BETA-MAT-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Beta Material',
          unit: 'KG',
          updated_at: new Date(),
        },
      });

      await prisma.inventory_stock.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          site_id: betaSiteId,
          material_id: betaMaterialId,
          quantity_on_hand: 500,
          quantity_reserved: 0,
          updated_at: new Date(),
        },
      });

      const response = await apiRequest(app)
        .get(apiPath('/inventory'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);

      const inventory = bodyOf<Array<{ organization_id: string }>>(response);

      expect(inventory.every((item) => item.organization_id === organizationId)).toBe(true);

      expect(inventory.some((item) => item.organization_id === otherOrganizationId)).toBe(false);
    });

    it('rejects cross-tenant work order material creation', async () => {
      const betaSite = await prisma.sites.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Beta Cross Tenant Work Order Site',
          code: `BETA-WOM-${crypto.randomUUID().slice(0, 8)}`,
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaWorkOrder = await prisma.work_orders.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Beta Work Order',
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const alphaMaterial = await prisma.materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: organizationId,
          code: `ALPHA-CROSS-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Alpha Cross Tenant Material',
          unit: 'KG',
          updated_at: new Date(),
        },
      });

      await apiRequest(app)
        .post(apiPath('/work-order-materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderId: betaWorkOrder.id,
          materialId: alphaMaterial.id,
          siteId: betaSite.id,
          requiredQuantity: 10,
        })
        .expect(404);
    });

    it('rejects cross-tenant inventory movement creation', async () => {
      const betaSite = await prisma.sites.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Beta Site',
          code: `BETA-CROSS-${crypto.randomUUID().slice(0, 8)}`,
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaMaterial = await prisma.materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          code: `BETA-CROSS-MAT-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Beta Cross Tenant Material',
          unit: 'KG',
          updated_at: new Date(),
        },
      });

      await apiRequest(app)
        .post(apiPath('/inventory/movements'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          siteId: betaSite.id,
          materialId: betaMaterial.id,
          movementType: 'RECEIPT',
          quantity: 10,
        })
        .expect(404);
    });

    it('rejects cross-tenant work order material consumption', async () => {
      const betaSite = await prisma.sites.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Beta Consumption Site',
          code: `BETA-CONSUME-${crypto.randomUUID().slice(0, 8)}`,
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaMaterial = await prisma.materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          code: `BETA-CONSUME-MAT-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Beta Consumption Material',
          unit: 'KG',
          updated_at: new Date(),
        },
      });

      const betaWorkOrder = await prisma.work_orders.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Beta Consumption Work Order',
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaWorkOrderMaterial = await prisma.work_order_materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          work_order_id: betaWorkOrder.id,
          material_id: betaMaterial.id,
          site_id: betaSite.id,
          required_quantity: 10,
          reserved_quantity: 10,
          consumed_quantity: 0,
          status: 'RESERVED',
          updated_at: new Date(),
        },
      });

      await prisma.inventory_stock.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          site_id: betaSite.id,
          material_id: betaMaterial.id,
          quantity_on_hand: 20,
          quantity_reserved: 10,
          updated_at: new Date(),
        },
      });

      await apiRequest(app)
        .post(apiPath('/work-order-materials/consume'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderMaterialId: betaWorkOrderMaterial.id,
          quantity: 5,
        })
        .expect(404);

      const betaMaterialAfter = await prisma.work_order_materials.findUniqueOrThrow({
        where: {
          id: betaWorkOrderMaterial.id,
        },
      });

      const betaStockAfter = await prisma.inventory_stock.findFirstOrThrow({
        where: {
          organization_id: otherOrganizationId,
          site_id: betaSite.id,
          material_id: betaMaterial.id,
        },
      });

      expect(Number(betaMaterialAfter.reserved_quantity)).toBe(10);
      expect(Number(betaMaterialAfter.consumed_quantity)).toBe(0);
      expect(betaMaterialAfter.status).toBe('RESERVED');
      expect(Number(betaStockAfter.quantity_on_hand)).toBe(20);
      expect(Number(betaStockAfter.quantity_reserved)).toBe(10);
    });

    it('rejects an invalid work order material consumption payload', async () => {
      await apiRequest(app)
        .post(apiPath('/work-order-materials/consume'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          workOrderMaterialId: 'not-a-uuid',
          quantity: 0,
        })
        .expect(400);
    });

    it('does not expose another organization work order materials', async () => {
      const betaSiteId = crypto.randomUUID();

      await prisma.sites.create({
        data: {
          id: betaSiteId,
          name: 'Beta Work Order Materials Site',
          code: `BETA-WOM-${crypto.randomUUID().slice(0, 8)}`,
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaWorkOrder = await prisma.work_orders.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Beta Procurement Work Order',
          organization_id: otherOrganizationId,
          updated_at: new Date(),
        },
      });

      const betaMaterial = await prisma.materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          code: `BETA-WOM-${crypto.randomUUID().slice(0, 8)}`,
          name: 'Beta Work Order Material',
          unit: 'KG',
          updated_at: new Date(),
        },
      });

      await prisma.work_order_materials.create({
        data: {
          id: crypto.randomUUID(),
          organization_id: otherOrganizationId,
          work_order_id: betaWorkOrder.id,
          material_id: betaMaterial.id,
          site_id: betaSiteId,
          required_quantity: 25,
          reserved_quantity: 0,
          consumed_quantity: 0,
          status: 'REQUIRED',
          updated_at: new Date(),
        },
      });

      const response = await apiRequest(app)
        .get(apiPath(`/work-order-materials?workOrderId=${betaWorkOrder.id}`))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);

      const materials = bodyOf<Array<{ organization_id: string }>>(response);

      expect(materials).toHaveLength(0);
    });
  });

  describe('operator permissions', () => {
    it('keeps procurement available to roles with procurement permissions', async () => {
      await setProcurementPlan(`TEST_PROCUREMENT_OPERATOR_${crypto.randomUUID()}`, true);

      const response = await apiRequest(app)
        .get(apiPath('/materials'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .expect(200);

      expect(Array.isArray(bodyOf<unknown[]>(response))).toBe(true);
    });
  });
});
