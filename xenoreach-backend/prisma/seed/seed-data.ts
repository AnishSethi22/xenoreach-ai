import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rahul Kumar', 'Ananya Singh', 'Vikram Mehta',
  'Kavita Reddy', 'Arjun Gupta', 'Pooja Iyer', 'Rohan Joshi', 'Sneha Nair',
  'Amit Verma', 'Deepika Chopra', 'Karan Malhotra', 'Riya Agarwal', 'Siddharth Roy',
  'Neha Bose', 'Manish Tiwari', 'Anjali Mishra', 'Suresh Pillai', 'Meera Krishnan',
  'Aditya Shah', 'Divya Rao', 'Nitin Desai', 'Simran Kaur', 'Varun Sinha',
  'Lakshmi Venkatesh', 'Gaurav Pandey', 'Swati Saxena', 'Rajesh Khanna', 'Preeti Das',
  'Abhishek Mukherjee', 'Sunita Yadav', 'Mohit Bansal', 'Ritika Kapoor', 'Harsh Srivastava',
  'Poonam Bhatt', 'Sandeep Chaudhary', 'Alka Trivedi', 'Vinay Jain', 'Rekha Nanda',
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
  'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh', 'Kochi', 'Coimbatore', 'Indore',
];

const STATES: Record<string, string> = {
  Mumbai: 'Maharashtra', Delhi: 'Delhi', Bengaluru: 'Karnataka',
  Hyderabad: 'Telangana', Ahmedabad: 'Gujarat', Chennai: 'Tamil Nadu',
  Kolkata: 'West Bengal', Pune: 'Maharashtra', Jaipur: 'Rajasthan',
  Surat: 'Gujarat', Lucknow: 'Uttar Pradesh', Chandigarh: 'Punjab',
  Kochi: 'Kerala', Coimbatore: 'Tamil Nadu', Indore: 'Madhya Pradesh',
};

const CATEGORIES = [
  'Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home & Living',
  'Beauty', 'Sports', 'Books', 'Groceries', 'Toys',
];

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

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

export async function seedCustomers(): Promise<string[]> {
  console.log('  Seeding 1000 customers...');
  const customerIds: string[] = [];

  for (let i = 0; i < 1000; i++) {
    const baseName = pickRandom(INDIAN_NAMES);
    const nameParts = baseName.split(' ');
    const name = `${nameParts[0]} ${nameParts[1]} ${i + 1}`;
    const email = `${nameParts[0].toLowerCase()}${nameParts[1].toLowerCase()}${i + 1}@example.com`;
    const city = pickRandom(CITIES);
    const gender = Math.random() > 0.45 ? 'male' : 'female';
    const dob = randomDate(365 * 45, 365 * 18);
    const phone = `+91${rand(7000000000, 9999999999)}`;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        city,
        state: STATES[city],
        gender,
        dateOfBirth: dob,
        externalId: `CUST-${String(i + 1).padStart(5, '0')}`,
      },
    });

    customerIds.push(customer.id);
  }

  console.log(`  Created ${customerIds.length} customers`);
  return customerIds;
}

export async function seedOrders(customerIds: string[]): Promise<void> {
  console.log('  Seeding 5000+ orders...');
  let totalOrders = 0;

  for (const customerId of customerIds) {
    const orderCount = rand(1, 12);
    let totalSpend = 0;
    let lastOrderDate = new Date(0);
    let firstOrderDate = new Date();

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
        const productName = pickRandom(PRODUCTS[category] || ['Item']);
        const unitPrice = rand(299, 8999);
        const quantity = rand(1, 3);
        const itemTotal = unitPrice * quantity;
        orderTotal += itemTotal;
        items.push({
          productId: `PRD-${rand(1000, 9999)}`,
          productName,
          category,
          quantity,
          unitPrice: new Prisma.Decimal(unitPrice),
          totalPrice: new Prisma.Decimal(itemTotal),
        });
      }

      totalSpend += orderTotal;

      await prisma.order.create({
        data: {
          customerId,
          orderNumber: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
          status: Math.random() > 0.05 ? 'COMPLETED' : 'REFUNDED',
          totalAmount: new Prisma.Decimal(orderTotal.toFixed(2)),
          itemCount,
          channel,
          storeId: channel === 'IN_STORE' ? `STORE-${rand(1, 50)}` : undefined,
          createdAt: orderDate,
          items: { createMany: { data: items } },
        },
      });

      totalOrders++;
    }

    const metrics = generateCustomerMetrics(orderCount, totalSpend, lastOrderDate);

    await prisma.customerMetrics.create({
      data: {
        customerId,
        ...metrics,
        lastOrderDate,
        firstOrderDate,
      },
    });
  }

  console.log(`  Created ${totalOrders} orders`);
}

export async function seedCampaigns(customerIds: string[]): Promise<void> {
  console.log('  Seeding historical campaigns...');

  const campaigns = [
    {
      name: 'Diwali Comeback Drive',
      goal: 'Reactivate customers inactive for 60+ days with festive offers',
      channel: 'WHATSAPP',
      segmentRules: {
        operator: 'AND',
        conditions: [
          { field: 'days_since_last', operator: 'gte', value: 60 },
          { field: 'total_spend', operator: 'gte', value: 2000 },
        ],
      },
      audienceSize: 180,
      messageTemplate: 'Happy Diwali {{name}}! 🪔 We miss you! Enjoy 20% off your next order. Use code DIWALI20. Shop now!',
      status: 'COMPLETED',
      deliveryRate: 0.95,
      openRate: 0.68,
      clickRate: 0.31,
      conversionRate: 0.13,
      revenue: 284500,
    },
    {
      name: 'VIP Loyalty Reward',
      goal: 'Reward GOLD and PLATINUM customers with exclusive early access',
      channel: 'EMAIL',
      segmentRules: {
        operator: 'AND',
        conditions: [
          { field: 'loyalty_tier', operator: 'in', value: ['GOLD', 'PLATINUM'] },
        ],
      },
      audienceSize: 95,
      messageTemplate: 'Hi {{name}}, as one of our most valued customers, you get early access to our new collection before anyone else. Click to explore!',
      subjectLine: 'Exclusive Early Access Just For You, {{name}} ✨',
      status: 'COMPLETED',
      deliveryRate: 0.92,
      openRate: 0.42,
      clickRate: 0.19,
      conversionRate: 0.09,
      revenue: 182000,
    },
    {
      name: 'Churn Risk Prevention',
      goal: 'Prevent high-value customers showing churn signals from leaving',
      channel: 'SMS',
      segmentRules: {
        operator: 'AND',
        conditions: [
          { field: 'churn_probability', operator: 'gte', value: 0.6 },
          { field: 'total_spend', operator: 'gte', value: 5000 },
        ],
      },
      audienceSize: 120,
      messageTemplate: 'Hi {{name}}, we noticed you haven\'t visited in a while. Here\'s 15% off your next purchase. Valid 7 days. Use code WINBACK15.',
      status: 'COMPLETED',
      deliveryRate: 0.94,
      openRate: 0.51,
      clickRate: 0.18,
      conversionRate: 0.07,
      revenue: 95000,
    },
    {
      name: 'Champions Upsell Campaign',
      goal: 'Upsell premium products to most engaged customers',
      channel: 'RCS',
      segmentRules: {
        operator: 'AND',
        conditions: [
          { field: 'rfm_segment', operator: 'eq', value: 'Champions' },
        ],
      },
      audienceSize: 67,
      messageTemplate: 'Hey {{name}}! 🌟 You\'re one of our top customers. We\'ve curated a premium selection just for you. Explore our new arrivals!',
      status: 'COMPLETED',
      deliveryRate: 0.89,
      openRate: 0.55,
      clickRate: 0.27,
      conversionRate: 0.15,
      revenue: 145000,
    },
    {
      name: 'New Season Collection Launch',
      goal: 'Announce summer collection to active customers',
      channel: 'WHATSAPP',
      segmentRules: {
        operator: 'AND',
        conditions: [
          { field: 'days_since_last', operator: 'lte', value: 30 },
          { field: 'engagement_score', operator: 'gte', value: 50 },
        ],
      },
      audienceSize: 320,
      messageTemplate: 'Hi {{name}}! ☀️ Our Summer 2025 collection is here! Be the first to shop new arrivals with free delivery. Shop now!',
      status: 'RUNNING',
      deliveryRate: 0.94,
      openRate: 0.64,
      clickRate: 0.24,
      conversionRate: 0.10,
      revenue: 412000,
    },
  ];

  for (const c of campaigns) {
    const campaignDate = randomDate(120, 7);
    const launched = new Date(campaignDate.getTime() - rand(1, 5) * 24 * 60 * 60 * 1000);

    const campaign = await prisma.campaign.create({
      data: {
        name: c.name,
        goal: c.goal,
        channel: c.channel,
        segmentRules: c.segmentRules as Prisma.InputJsonValue,
        audienceSize: c.audienceSize,
        messageTemplate: c.messageTemplate,
        subjectLine: c.subjectLine,
        status: c.status,
        launchedAt: launched,
        completedAt: c.status === 'COMPLETED' ? campaignDate : undefined,
        createdAt: new Date(launched.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    const recipientSample = customerIds.slice(0, Math.min(c.audienceSize, customerIds.length));
    const shuffled = recipientSample.sort(() => Math.random() - 0.5).slice(0, c.audienceSize);

    await prisma.campaignRecipient.createMany({
      data: shuffled.map((cid) => ({
        campaignId: campaign.id,
        customerId: cid,
        status: 'CONVERTED',
        personalizedMsg: c.messageTemplate,
      })),
      skipDuplicates: true,
    });

    const totalRecipients = shuffled.length;
    const delivered = Math.round(totalRecipients * c.deliveryRate);
    const opened = Math.round(delivered * c.openRate);
    const clicked = Math.round(delivered * c.clickRate);
    const converted = Math.round(delivered * c.conversionRate);
    const failed = totalRecipients - delivered;

    await prisma.campaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        totalRecipients,
        sentCount: totalRecipients,
        deliveredCount: delivered,
        failedCount: failed,
        openedCount: opened,
        readCount: Math.round(opened * 0.85),
        clickedCount: clicked,
        convertedCount: converted,
        revenueAttributed: new Prisma.Decimal(c.revenue),
        deliveryRate: new Prisma.Decimal(c.deliveryRate),
        openRate: new Prisma.Decimal(c.openRate),
        clickRate: new Prisma.Decimal(c.clickRate),
        conversionRate: new Prisma.Decimal(c.conversionRate),
      },
    });

    const eventTypes: Array<'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'CONVERTED'> = ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'CONVERTED'];
    const eventSamples = [totalRecipients, delivered, opened, clicked, converted];

    for (let i = 0; i < eventTypes.length; i++) {
      const count = Math.min(eventSamples[i], 50);
      const sample = shuffled.slice(0, count);
      for (const cid of sample) {
        const recipient = await prisma.campaignRecipient.findFirst({
          where: { campaignId: campaign.id, customerId: cid },
        });
        if (recipient) {
          await prisma.communicationEvent.create({
            data: {
              recipientId: recipient.id,
              campaignId: campaign.id,
              customerId: cid,
              channel: c.channel,
              eventType: eventTypes[i],
              occurredAt: randomDate(90, 1),
            },
          });
        }
      }
    }
  }

  console.log(`  Created ${campaigns.length} campaigns with analytics`);
}

export async function seedInsights(): Promise<void> {
  console.log('  Seeding AI insights...');

  await prisma.aiInsight.createMany({
    data: [
      {
        type: 'CHANNEL_PERFORMANCE',
        title: 'WhatsApp outperforming Email by 112%',
        body: 'WhatsApp campaigns are achieving 68% open rates vs 32% for Email. Your WhatsApp campaigns also drive 2.3x more conversions per delivered message. Consider reallocating 30% of Email budget to WhatsApp.',
        priority: 'HIGH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'AUDIENCE_OPPORTUNITY',
        title: '180 high-value customers ready for win-back',
        body: 'You have 180 customers with ₹5,000+ lifetime spend who have not ordered in 45-90 days. These represent ₹12.4L in potential revenue if reactivated. A personalized WhatsApp campaign with a 15% discount could recover 15-20% of them.',
        priority: 'HIGH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'CHURN_RISK',
        title: '127 GOLD customers at high churn risk',
        body: 'Your GOLD tier customers are showing elevated churn probability (>0.65). Average spend per customer in this group is ₹8,200. Act now before they drop to SILVER tier. A loyalty bonus campaign within the next 14 days is recommended.',
        priority: 'HIGH',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'RETENTION',
        title: 'Champions segment drives 42% of total revenue',
        body: 'Your 67 Champions (top RFM segment) contribute 42% of total attributed revenue. Investing in exclusive perks and early-access campaigns for this group has historically yielded 3.2x ROI vs other segments.',
        priority: 'MEDIUM',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'GENERAL',
        title: 'Bengaluru customers convert 34% more than average',
        body: 'Customers from Bengaluru show significantly higher conversion rates (18% vs 13% national average) and larger average order values (₹4,200 vs ₹2,800). Consider geo-targeted campaigns for this market.',
        priority: 'MEDIUM',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        type: 'AUDIENCE_OPPORTUNITY',
        title: 'SILVER tier customers approaching GOLD threshold',
        body: '94 SILVER customers are within ₹800 of the GOLD loyalty tier (5,000 points). A targeted spend-and-earn campaign could upgrade them, which historically increases order frequency by 2.4x.',
        priority: 'LOW',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('  Created AI insights');
}
