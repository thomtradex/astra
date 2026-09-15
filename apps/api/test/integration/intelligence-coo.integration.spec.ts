import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import { bodyOf } from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import {
  login,
  seedIntegrationTestData,
} from '../helpers/test-data';

async function waitForCooActionAudit(
  prisma: PrismaService,
  organizationId: string,
  actorId: string,
  resourceId: string,
) {
  const deadline = Date.now() + 2000;

  while (Date.now() < deadline) {
    const audits = await prisma.auditLog.findMany({
      where: {
        organizationId,
        actorId,
        action: 'UPDATE',
        resource: 'work_orders',
        resourceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const audit = audits.find((item) => {
      const metadata =
        item.metadata &&
        typeof item.metadata === 'object' &&
        !Array.isArray(item.metadata)
          ? (item.metadata as Record<string, unknown>)
          : null;

      return metadata?.type === 'coo_action';
    });

    if (audit) {
      return audit;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return null;
}

describe('COO intelligence decision loop (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let organizationId: string;
  let otherOrganizationId: string;
  let alphaAdminId: string;
  let alphaAdminToken: string;
  let betaAdminId: string;

  beforeAll(async () => {
    const context = await createTestApp();

    app = context.app;
    prisma = context.prisma;

    const seed = await seedIntegrationTestData(prisma);

    organizationId = seed.organizationId;
    otherOrganizationId = seed.otherOrganizationId;
    alphaAdminId = seed.adminUserId;

    alphaAdminToken = (
      await login(app, 'admin@alpha.test')
    ).accessToken;

    betaAdminId = await prisma.user.findFirstOrThrow({
      where: {
        organizationId: otherOrganizationId,
        email: 'admin@beta.test',
      },
      select: {
        id: true,
      },
    }).then((user) => user.id);

    const now = new Date();

    const plan = await prisma.billingPlan.upsert({
      where: {
        code: 'TEST_COO_INTELLIGENCE',
      },
      update: {
        isActive: true,
        features: {
          intelligence: true,
          workOrderManagement: true,
          cooActions: true,
        },
        limits: {},
      },
      create: {
        code: 'TEST_COO_INTELLIGENCE',
        name: 'COO Integration Test',
        description: 'Integration test entitlement',
        monthlyPriceCents: 0,
        currency: 'EUR',
        trialDays: 0,
        isActive: true,
        displayOrder: 999,
        features: {
          intelligence: true,
          workOrderManagement: true,
          cooActions: true,
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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('detects an unassigned priority work order, assigns it, audits the action, and removes the signal', async () => {
    const workOrder = await prisma.work_orders.create({
      data: {
        id: crypto.randomUUID(),
        title: 'COO Integration — Urgent Work Order',
        description: 'Integration test work order',
        status: 'OPEN',
        priority: 'HIGH',
        organization_id: organizationId,
        assigned_to_id: null,
        updated_at: new Date(),
      },
    });

    const initialBriefing = await apiRequest(app)
      .get(apiPath('/intelligence/briefing'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(200);

    const initialSignals = bodyOf<{
      signals: Array<{
        id: string;
        type: string;
        action?: {
          type: string;
          resource: string;
          resourceId?: string;
          requiresAuthorization: boolean;
        };
      }>;
    }>(initialBriefing).signals;

    const signal = initialSignals.find(
      (item) =>
        item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' &&
        item.action?.resourceId === workOrder.id,
    );

    expect(signal).toBeDefined();
    expect(signal?.action).toEqual({
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: workOrder.id,
      requiresAuthorization: true,
    });

    await apiRequest(app)
      .post(apiPath('/intelligence/actions'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .send({
        type: 'ASSIGN_WORK_ORDER',
        resourceId: workOrder.id,
        assignedToId: alphaAdminId,
      })
      .expect(201);

    const assignedWorkOrder = await prisma.work_orders.findUnique({
      where: {
        id: workOrder.id,
      },
      select: {
        assigned_to_id: true,
        organization_id: true,
      },
    });

    expect(assignedWorkOrder).toEqual({
      assigned_to_id: alphaAdminId,
      organization_id: organizationId,
    });

    const audit = await waitForCooActionAudit(
      prisma,
      organizationId,
      alphaAdminId,
      workOrder.id,
    );

    expect(audit).toBeDefined();









    expect(audit?.action).toBe('UPDATE');
    expect(audit?.organizationId).toBe(organizationId);
    expect(audit?.actorId).toBe(alphaAdminId);
    expect(audit?.resourceId).toBe(workOrder.id);
    expect(audit?.statusCode).toBeNull();

    const auditMetadata =
      audit?.metadata &&
      typeof audit.metadata === 'object' &&
      !Array.isArray(audit.metadata)
        ? (audit.metadata as Record<string, unknown>)
        : null;

    expect(auditMetadata).toMatchObject({
      type: 'coo_action',
      source: 'coo',
      actionType: 'ASSIGN_WORK_ORDER',
      authorizationPolicy: 'CanManageWorkOrders',
      assignedToId: alphaAdminId,
    });

    const actionRequestAudit = await prisma.auditLog.findFirst({
      where: {
        organizationId,
        actorId: alphaAdminId,
        resource: 'intelligence',
        method: 'POST',
        action: 'CREATE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(actionRequestAudit).toBeDefined();

    const finalBriefing = await apiRequest(app)
      .get(apiPath('/intelligence/briefing'))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .expect(200);

    const finalSignals = bodyOf<{
      signals: Array<{
        type: string;
        action?: {
          resourceId?: string;
        };
      }>;
    }>(finalBriefing).signals;

    expect(
      finalSignals.some(
        (item) =>
          item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' &&
          item.action?.resourceId === workOrder.id,
      ),
    ).toBe(false);
  });

    it('executes SET_PROJECT_STATUS through the HTTP COO action endpoint and audits it', async () => {
      const project = await prisma.projects.create({
        data: {
          id: `project-coo-http-${Date.now()}`,
          name: 'COO HTTP Project',
          code: `COO-HTTP-${Date.now()}`,
          organization_id: organizationId,
          status: 'IN_PROGRESS',
          progress: 40,
          end_date: new Date('2026-01-15T10:00:00.000Z'),
          updated_at: new Date(),
        },
      });

      await apiRequest(app)
        .post(apiPath('/intelligence/actions'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          type: 'SET_PROJECT_STATUS',
          resourceId: project.id,
          status: 'ON_HOLD',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              allowed: true,
              status: 'EXECUTED',
              resourceId: project.id,
            }),
          );
        });

      const updatedProject = await prisma.projects.findUnique({
        where: { id: project.id },
      });

      expect(updatedProject?.status).toBe('ON_HOLD');

      const audit = await prisma.auditLog.findFirst({
        where: {
          organizationId,
          resourceId: project.id,
          action: 'UPDATE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(audit).toEqual(
        expect.objectContaining({
          organizationId,
          resourceId: project.id,
          actorId: expect.any(String) as unknown,
          action: 'UPDATE',
          method: null,
          statusCode: null,
        }),
      );
    });

    it('executes UPDATE_MAINTENANCE through the HTTP COO action endpoint and audits it', async () => {
      const asset = await prisma.assets.create({
        data: {
          id: `asset-coo-http-${Date.now()}`,
          name: 'COO HTTP Test Asset',
          code: `COO-HTTP-${Date.now()}`,
          organization_id: organizationId,
          updated_at: new Date(),
        },
      });

      const maintenancePlan = await prisma.maintenance_plans.create({
        data: {
          id: `maintenance-coo-http-${Date.now()}`,
          plan: 'COO HTTP Maintenance',
          assetId: asset.id,
          frequency: 'MONTHLY',
          nextDue: new Date(Date.now() - 86400000),
          organization_id: organizationId,
          updated_at: new Date(),
        },
      });

      const nextDue = new Date('2099-06-15T10:00:00.000Z');

      await apiRequest(app)
        .post(apiPath('/intelligence/actions'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send({
          type: 'UPDATE_MAINTENANCE',
          resourceId: maintenancePlan.id,
          nextDue: nextDue.toISOString(),
        })
        .expect(201);

      const updatedPlan = await prisma.maintenance_plans.findUnique({
        where: {
          id: maintenancePlan.id,
        },
      });

      expect(updatedPlan).toBeDefined();
      expect(updatedPlan!.organization_id).toBe(organizationId);
      expect(updatedPlan!.nextDue.toISOString()).toBe(nextDue.toISOString());

      const audit = await prisma.auditLog.findFirst({
        where: {
          organizationId,
          actorId: alphaAdminId,
          action: 'UPDATE',
          resource: 'maintenance_plans',
          resourceId: maintenancePlan.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(audit).toBeDefined();

      expect(audit!.metadata).toMatchObject({
        type: 'coo_action',
        source: 'coo',
        actionType: 'UPDATE_MAINTENANCE',
        authorizationPolicy: 'CanManageMaintenance',
        nextDue: nextDue.toISOString(),
      });
    });

    it('rejects invalid COO action payloads at the HTTP boundary', async () => {
    const invalidPayloads = [
      {
        type: 'UPDATE_MAINTENANCE',
        resourceId: crypto.randomUUID(),
      },
      {
        type: 'ASSIGN_WORK_ORDER',
        resourceId: crypto.randomUUID(),
      },
      {
        type: 'UNSUPPORTED_ACTION',
        resourceId: crypto.randomUUID(),
      },
      {
        type: 'UPDATE_MAINTENANCE',
        resourceId: crypto.randomUUID(),
        nextDue: 'not-a-date',
      },
      {
        type: 'ASSIGN_WORK_ORDER',
        resourceId: crypto.randomUUID(),
        assignedToId: '',
      },
    ];

    for (const payload of invalidPayloads) {
      await apiRequest(app)
        .post(apiPath('/intelligence/actions'))
        .set('Authorization', `Bearer ${alphaAdminToken}`)
        .send(payload)
        .expect(400);
    }
    });



  it('does not allow Alpha to assign a Beta user to an Alpha work order', async () => {
    const workOrder = await prisma.work_orders.create({
      data: {
        id: crypto.randomUUID(),
        title: 'COO Integration — Tenant Boundary',
        description: 'Cross-tenant assignment test',
        status: 'OPEN',
        priority: 'HIGH',
        organization_id: organizationId,
        assigned_to_id: null,
        updated_at: new Date(),
      },
    });

    await apiRequest(app)
      .patch(apiPath(`/work-orders/${workOrder.id}`))
      .set('Authorization', `Bearer ${alphaAdminToken}`)
      .send({
        assignedToId: betaAdminId,
      })
      .expect(404);

    const unchanged = await prisma.work_orders.findUnique({
      where: {
        id: workOrder.id,
      },
      select: {
        assigned_to_id: true,
        organization_id: true,
      },
    });

    expect(unchanged).toEqual({
      assigned_to_id: null,
      organization_id: organizationId,
    });

  });
});
