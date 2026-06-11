const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.campaign.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  console.log('--- DB COUNTS ---');
  result.forEach(r => console.log(r.status + ': ' + r._count.status));
}

main().catch(console.error).finally(() => prisma.$disconnect());
