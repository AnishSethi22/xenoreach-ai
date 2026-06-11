import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

type EventType = 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED' | 'READ' | 'CLICKED' | 'CONVERTED';

interface SimulationConfig {
  deliveryRate: number;
  openRate: number;
  readRate: number;
  clickRate: number;
  conversionRate: number;
  avgOrderValue: number;
}

const CHANNEL_CONFIGS: Record<string, SimulationConfig> = {
  WHATSAPP: {
    deliveryRate: 0.96,
    openRate: 0.72,
    readRate: 0.65,
    clickRate: 0.28,
    conversionRate: 0.12,
    avgOrderValue: 2800,
  },
  SMS: {
    deliveryRate: 0.94,
    openRate: 0.55,
    readRate: 0.48,
    clickRate: 0.12,
    conversionRate: 0.05,
    avgOrderValue: 2200,
  },
  EMAIL: {
    deliveryRate: 0.91,
    openRate: 0.32,
    readRate: 0.28,
    clickRate: 0.14,
    conversionRate: 0.06,
    avgOrderValue: 3100,
  },
  RCS: {
    deliveryRate: 0.88,
    openRate: 0.48,
    readRate: 0.42,
    clickRate: 0.19,
    conversionRate: 0.08,
    avgOrderValue: 2600,
  },
};

function jitter(base: number, variance = 0.05): number {
  return base + (Math.random() * variance * 2 - variance);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordEvent(
  recipientId: string,
  campaignId: string,
  customerId: string,
  channel: string,
  eventType: EventType,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await prisma.communicationEvent.create({
    data: {
      recipientId,
      campaignId,
      customerId,
      channel,
      eventType,
      metadata: metadata as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.campaignRecipient.update({
    where: { id: recipientId },
    data: { status: eventType },
  });

  await updateCampaignAnalytics(campaignId, eventType, metadata.revenueAmount as number);
}

async function updateCampaignAnalytics(
  campaignId: string,
  eventType: EventType,
  revenueAmount?: number,
): Promise<void> {
  const countField: Record<EventType, string | null> = {
    SENT: 'sentCount',
    DELIVERED: 'deliveredCount',
    FAILED: 'failedCount',
    OPENED: 'openedCount',
    READ: 'readCount',
    CLICKED: 'clickedCount',
    CONVERTED: 'convertedCount',
  };

  const field = countField[eventType];
  if (!field) return;

  const analytics = await prisma.campaignAnalytics.findUnique({
    where: { campaignId },
  });

  if (!analytics) return;

  const update: Record<string, unknown> = {
    [field]: { increment: 1 },
    updatedAt: new Date(),
  };

  if (revenueAmount && eventType === 'CONVERTED') {
    update.revenueAttributed = { increment: revenueAmount };
    update.convertedCount = { increment: 1 };
    delete update[field];
  }

  await prisma.campaignAnalytics.update({
    where: { campaignId },
    data: update as Parameters<typeof prisma.campaignAnalytics.update>[0]['data'],
  });

  await recalculateRates(campaignId);
}

async function recalculateRates(campaignId: string): Promise<void> {
  const analytics = await prisma.campaignAnalytics.findUnique({
    where: { campaignId },
  });

  if (!analytics || analytics.totalRecipients === 0) return;

  const total = analytics.totalRecipients;
  const delivered = analytics.deliveredCount;

  await prisma.campaignAnalytics.update({
    where: { campaignId },
    data: {
      deliveryRate: total > 0 ? analytics.deliveredCount / total : 0,
      openRate: delivered > 0 ? analytics.openedCount / delivered : 0,
      clickRate: delivered > 0 ? analytics.clickedCount / delivered : 0,
      conversionRate: delivered > 0 ? analytics.convertedCount / delivered : 0,
    },
  });
}

async function simulateRecipient(
  recipientId: string,
  campaignId: string,
  customerId: string,
  channel: string,
  config: SimulationConfig,
): Promise<void> {
  try {
    await delay(500 + Math.random() * 2000);
    await recordEvent(recipientId, campaignId, customerId, channel, 'SENT');

    await delay(1000 + Math.random() * 5000);
    if (Math.random() > jitter(config.deliveryRate)) {
      await recordEvent(recipientId, campaignId, customerId, channel, 'FAILED', {
        reason: 'Delivery failed',
      });
      return;
    }
    await recordEvent(recipientId, campaignId, customerId, channel, 'DELIVERED');

    await delay(5000 + Math.random() * 30000);
    if (Math.random() > jitter(config.openRate)) return;
    await recordEvent(recipientId, campaignId, customerId, channel, 'OPENED');

    await delay(2000 + Math.random() * 10000);
    if (Math.random() > jitter(config.readRate)) return;
    await recordEvent(recipientId, campaignId, customerId, channel, 'READ');

    await delay(3000 + Math.random() * 15000);
    if (Math.random() > jitter(config.clickRate)) return;
    await recordEvent(recipientId, campaignId, customerId, channel, 'CLICKED');

    await delay(5000 + Math.random() * 20000);
    if (Math.random() > jitter(config.conversionRate)) return;

    const orderAmount = config.avgOrderValue * (0.7 + Math.random() * 0.6);
    await recordEvent(recipientId, campaignId, customerId, channel, 'CONVERTED', {
      revenueAmount: Math.round(orderAmount),
    });
  } catch (err) {
    console.error(`[ChannelSimulator] Error simulating recipient ${recipientId}:`, err);
  }
}

export async function simulateCampaignDelivery(
  campaignId: string,
  channel: string,
): Promise<void> {
  const config = CHANNEL_CONFIGS[channel] || CHANNEL_CONFIGS['EMAIL'];

  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId, status: 'PENDING' },
    select: { id: true, customerId: true },
  });

  if (recipients.length === 0) return;

  await prisma.campaignAnalytics.upsert({
    where: { campaignId },
    create: {
      campaignId,
      totalRecipients: recipients.length,
    },
    update: {
      totalRecipients: recipients.length,
    },
  });

  const BATCH_SIZE = 10;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((r) =>
        simulateRecipient(r.id, campaignId, r.customerId, channel, config),
      ),
    );
    if (i + BATCH_SIZE < recipients.length) {
      await delay(100);
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
}
