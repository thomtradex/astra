const { PrismaClient } = require('@astra/database');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      email: 'admin@alpha.test',
    },
    include: {
      organization: true,
    },
  });

  console.log('USER EXISTS:', !!user);

  if (!user) {
    process.exit(1);
  }

  console.log({
    id: user.id,
    email: user.email,
    org: user.organization.slug,
    active: user.isActive,
    hash: user.passwordHash,
    hashLength: user.passwordHash.length,
  });

  console.log(
    'PASSWORD CHECK:',
    await bcrypt.compare(
      'TestPassword123!',
      user.passwordHash,
    ),
  );
}

main()
  .finally(() => prisma.$disconnect());
