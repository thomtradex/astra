import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.organization.deleteMany();
}