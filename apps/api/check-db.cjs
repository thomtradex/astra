const { PrismaClient } = require('@astra/database');

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe('SELECT current_database(), current_schema()');

  console.log(result);

  const users = await prisma.user.count();

  console.log('USERS COUNT:', users);

  const orgs = await prisma.organization.count();

  console.log('ORGS COUNT:', orgs);
}

main().finally(() => prisma.$disconnect());
