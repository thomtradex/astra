import { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../src/prisma/prisma.service';
import { apiRequest } from '../helpers/http-client';
import {
  bodyOf,
  LoginResponse,
  OrganizationResponse,
  PaginatedResponse,
} from '../helpers/http-types';
import { apiPath, createTestApp } from '../helpers/test-app';
import {
  createUserWithRole,
  resetDatabase,
  seedRolesAndPermissions,
  TEST_PASSWORD,
} from '../helpers/test-data';

describe('Organizations integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  const password = TEST_PASSWORD;

  beforeAll(async () => {
    const context = await createTestApp();

    app = context.app;
    prisma = context.prisma;

    await resetDatabase(prisma);
    const seeded = await seedRolesAndPermissions(prisma);

    const organization = await prisma.organization.create({
      data: {
        name: 'Organization Test',
        slug: 'organization-test',
      },
    });

    await createUserWithRole(
      prisma,
      organization.id,
      'org-admin@test.local',
      'Org Admin',
      seeded.adminRoleId,
    );

    const login = await apiRequest(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'org-admin@test.local',
        password,
        organizationSlug: 'organization-test',
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Login falhou com HTTP ${response.status}`);
        }

        return response;
      });

    token = bodyOf<LoginResponse>(login).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists organizations with pagination', async () => {
    const response = await apiRequest(app)
      .get(apiPath('/organizations'))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(bodyOf<PaginatedResponse<OrganizationResponse>>(response).items).toHaveLength(1);
    expect(bodyOf<PaginatedResponse<OrganizationResponse>>(response).items[0]?.slug).toBe(
      'organization-test',
    );
    expect(bodyOf<PaginatedResponse<OrganizationResponse>>(response).pagination.total).toBe(1);
  });

  it('creates an organization', async () => {
    const response = await apiRequest(app)
      .post(apiPath('/organizations'))
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Second Organization',
        slug: 'second-organization',
      })
      .expect(201);

    expect(bodyOf<OrganizationResponse>(response).slug).toBe('second-organization');
    expect(bodyOf<OrganizationResponse>(response).is_active).toBe(true);
  });

  it('rejects duplicate organization slugs', async () => {
    await apiRequest(app)
      .post(apiPath('/organizations'))
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Duplicate',
        slug: 'organization-test',
      })
      .expect(409);
  });

  it('updates an organization', async () => {
    const organization = await prisma.organization.findUniqueOrThrow({
      where: { slug: 'second-organization' },
    });

    const response = await apiRequest(app)
      .patch(apiPath(`/organizations/${organization.id}`))
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Organization',
        slug: 'updated-organization',
      })
      .expect(200);

    expect(bodyOf<OrganizationResponse>(response).name).toBe('Updated Organization');
    expect(bodyOf<OrganizationResponse>(response).slug).toBe('updated-organization');
  });

  it('toggles organization activity', async () => {
    const organization = await prisma.organization.findUniqueOrThrow({
      where: { slug: 'updated-organization' },
    });

    const response = await apiRequest(app)
      .patch(apiPath(`/organizations/${organization.id}/active`))
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })
      .expect(200);

    expect(bodyOf<OrganizationResponse>(response).is_active).toBe(false);
  });
});
