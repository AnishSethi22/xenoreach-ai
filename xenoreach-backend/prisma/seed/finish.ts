/// <reference types="node" />
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// Re-use data arrays from seed-data
const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Groceries', 'Toys'];
const PRODUCTS: Record<string, string[]> = {
  Apparel: ['Cotton Kurta', 'Denim Jeans', 'Formal Shirt', 'Salwar Kameez', 'T-Shirt', 'Blazer'],
  Footwear: ['Running Shoes', 'Sandals', 'Heels', 'Loafers', 'Sports Shoes', 'Boots'],
  Accessories: ['Handbag', 'Watch', 'Sunglasses', 'Wallet', 'Belt', 'Earrings'],
  Electronics: ['Phone Cover', 'Earphones', 'Power Bank', 'Smart Watch', 'Tablet'],
  'Home & Living': ['Cushion Set', 'Table Lamp', 'Wall Art', 'Bed Sheet', 'Kitchen Set'],
  Beauty: ['Face Cream', 'Lipstick', 'Perfume', 'Face Wash', 'Shampoo', 'Foundation'],
  Sports: ['Yoga Mat', 'Water Bottle', 'Gym Gloves', 'Resistance Bands', 'Skipping Rope'],
  Books: ['Fiction Novel', 'Self Help Book', 'Cookbook', 'Biography', 'Business Strategy'],
  Groceries: ['Organic Spices', 'Premium Tea', 'Dry Fruits', 'Olive Oil'],
  Toys: ['Board Game', 'Puzzle', 'Action Figure', 'Educational Kit'],
};

function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysAgo: number, minDaysAgo = 0): Date {
  const ms = rand(minDaysAgo, daysAgo) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms);
}

function generateCustomerMetrics(orderCount: number, totalSpend: number, lastOrderDate: Date) {
  const daysSinceLast = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
  const churnProbability = Math.min(0.95, daysSinceLast > 90 ? 0.7 + Math.random() * 0.25 : daysSinceLast > 45 ? 0.3 + Math.random() * 0.4 : 0.05 + Math.random() * 0.2);
  const engagementScore = Math.max(5, 100 - (daysSinceLast * 0.8) + (orderCount * 2));
  const normalizedEngagement = Math.min(100, Math.max(0, engagementScore + (Math.random() * 20 - 10)));
  const recencyScore = daysSinceLast <= 30 ? 5 : daysSinceLast <= 60 ? 4 : daysSinceLast <= 90 ? 3 : daysSinceLast <= 180 ? 2 : 1;
  const frequencyScore = orderCount >= 20 ? 5 : orderCount >= 10 ? 4 : orderCount >= 5 ? 3 : orderCount >= 2 ? 2 : 1;
  const avgSpend = totalSpend / Math.max(1, orderCount);
  const monetaryScore = avgSpend >= 5000 ? 5 : avgSpend >= 3000 ? 4 : avgSpend >= 1500 ? 3 : avgSpend >= 500 ? 2 : 1;
  const rfmTotal = recencyScore + frequencyScore + monetaryScore;
  const rfmSegment = rfmTotal >= 13 ? 'Champions' : rfmTotal >= 10 ? 'Loyal Customers' : rfmTotal >= 8 ? 'Potential Loyalists' : rfmTotal >= 6 ? 'At Risk' : rfmTotal >= 4 ? 'Hibernating' : 'Lost';
  const loyaltyPoints = Math.floor(totalSpend / 10);
  const loyaltyTier = loyaltyPoints >= 10000 ? 'PLATINUM' : loyaltyPoints >= 5000 ? 'GOLD' : loyaltyPoints >= 1000 ? 'SILVER' : 'BRONZE';
  const purchasePropensity = recencyScore >= 4 ? 0.6 + Math.random() * 0.35 : recencyScore >= 3 ? 0.35 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;
  return {
    totalSpend: new Prisma.Decimal(totalSpend.toFixed(2)),
    orderCount,
    avgOrderValue: new Prisma.Decimal((totalSpend / Math.max(1, orderCount)).toFixed(2)),
    daysSinceLast,
    engagementScore: new Prisma.Decimal(normalizedEngagement.toFixed(2)),
    churnProbability: new Prisma.Decimal(churnProbability.toFixed(4)),
    purchasePropensity: new Prisma.Decimal(purchasePropensity.toFixed(4)),
    loyaltyTier,
    loyaltyPoints,
    recencyScore,
    frequencyScore,
    monetaryScore,
    rfmSegment,
  };
}

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try { return await operation(); }
    catch (err: any) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
  throw new Error('Unreachable');
}

async function chunkedPromises<T, R>(items: T[], chunkSize: number, processor: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    process.stdout.write("\rProcessed " + Math.min(i + chunkSize, items.length) + " / " + items.length + "...");
  }
  console.log();
  return results;
}

async function seedRemainingOrders(customerIds: string[]) {
  console.log('Seeding remaining orders with batching and retries...');
  let ordersCreated = 0;
  
  await chunkedPromises(customerIds, 20, async (customerId) => {
    return withRetry(async () => {
      // Check if metrics already exist
      const existingMetrics = await prisma.customerMetrics.findUnique({ where: { customerId } });
      if (existingMetrics) return;

      const orderCount = rand(1, 12);
      let totalSpend = 0;
      let lastOrderDate = new Date(0);
      let firstOrderDate = new Date();
      const ordersToCreate: any[] = [];

      for (let j = 0; j < orderCount; j++) {
        const orderDate = randomDate(730, 0);
        if (orderDate > lastOrderDate) lastOrderDate = orderDate;
        if (orderDate < firstOrderDate) firstOrderDate = orderDate;

        const itemCount = rand(1, 5);
        const category = pickRandom(CATEGORIES);
        const channel = pickRandom(['IN_STORE', 'ONLINE', 'APP', 'APP', 'ONLINE']);
        let orderTotal = 0;
        const items: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (let k = 0; k < itemCount; k++) {
          const unitPrice = rand(299, 8999);
          const quantity = rand(1, 3);
          const itemTotal = unitPrice * quantity;
          orderTotal += itemTotal;
          items.push({
            productId: "PRD-" + rand(1000, 9999),
            productName: pickRandom(PRODUCTS[category] || ['Item']),
            category,
            quantity,
            unitPrice: new Prisma.Decimal(unitPrice),
            totalPrice: new Prisma.Decimal(itemTotal),
          });
        }

        totalSpend += orderTotal;
        ordersToCreate.push({
          customerId,
          orderNumber: "ORD-" + randomUUID().slice(0, 8).toUpperCase(),
          status: Math.random() > 0.05 ? 'COMPLETED' : 'REFUNDED',
          totalAmount: new Prisma.Decimal(orderTotal.toFixed(2)),
          itemCount,
          channel,
          storeId: channel === 'IN_STORE' ? "STORE-" + rand(1, 50) : undefined,
          createdAt: orderDate,
          items: { createMany: { data: items } },
        });
      }

      for (const orderData of ordersToCreate) {
        await prisma.order.create({ data: orderData });
        ordersCreated++;
      }
      const metrics = generateCustomerMetrics(orderCount, totalSpend, lastOrderDate);
      await prisma.customerMetrics.create({
        data: { customerId, ...metrics, lastOrderDate, firstOrderDate },
      });
    });
  });
  console.log("Orders generated: " + ordersCreated);
}

async function main() {
  const args = process.argv.slice(2);
  const isLightweight = args.includes('--lightweight');
  
  console.log(isLightweight ? 'Running LIGHTWEIGHT seed mode...' : 'Running FULL seed mode...');

  let customers = await prisma.customer.findMany({ select: { id: true } });
  
  if (isLightweight && customers.length > 100) {
    customers = customers.slice(0, 100);
    console.log("Lightweight mode: Only processing " + customers.length + " customers.");
  }
  
  if (customers.length > 0) {
    await seedRemainingOrders(customers.map(c => c.id));
    
    // Check if campaigns exist
    const campaignCount = await prisma.campaign.count();
    if (campaignCount === 0) {
      console.log('Seeding Campaigns...');
      const { seedCampaigns, seedInsights } = require('./seed-data');
      await seedCampaigns(customers.map(c => c.id));
      await seedInsights();
    } else {
      console.log('Campaigns already seeded. Skipping.');
    }
  }

  console.log('Seed process completed successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
