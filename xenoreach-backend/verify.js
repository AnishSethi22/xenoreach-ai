const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tables = await prisma.$queryRaw`SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'`;
  const customers = await prisma.customer.count();
  const orders = await prisma.order.count();
  const campaigns = await prisma.campaign.count();
  
  console.log("=== Database Counts ===");
  console.log("Tables:", Number(tables[0].count));
  console.log("Customers:", customers);
  console.log("Orders:", orders);
  console.log("Campaigns:", campaigns);
}

run().finally(() => prisma.$disconnect());
