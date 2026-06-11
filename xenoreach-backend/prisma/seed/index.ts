/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { seedCustomers, seedOrders, seedCampaigns, seedInsights } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('XenoReach AI — Database Seed Starting...\n');

  console.log('Cleaning existing data...');
  await prisma.communicationEvent.deleteMany({});
  await prisma.campaignAnalytics.deleteMany({});
  await prisma.campaignRecipient.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customerMetrics.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.aiInsight.deleteMany({});
  console.log('Done.\n');

  const customerIds = await seedCustomers();
  await seedOrders(customerIds);
  await seedCampaigns(customerIds);
  await seedInsights();

  const counts = await Promise.all([
    prisma.customer.count(),
    prisma.order.count(),
    prisma.campaign.count(),
    prisma.aiInsight.count(),
  ]);

  console.log('\n=== Seed Complete ===');
  console.log(`Customers:  ${counts[0]}`);
  console.log(`Orders:     ${counts[1]}`);
  console.log(`Campaigns:  ${counts[2]}`);
  console.log(`AI Insights: ${counts[3]}`);
  console.log('====================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
