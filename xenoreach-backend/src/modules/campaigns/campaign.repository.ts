import { prisma } from '../../config/database';
import { CreateCampaignDto } from './campaign.dto';
import { Prisma } from '@prisma/client';

export class CampaignRepository {
  async create(data: CreateCampaignDto & { audienceSize: number }) {
    return prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        goal: data.goal,
        channel: data.channel,
        segmentRules: data.segmentRules as Prisma.InputJsonValue,
        audienceSize: data.audienceSize,
        messageTemplate: data.messageTemplate,
        subjectLine: data.subjectLine,
        aiReasoning: data.aiReasoning,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: 'DRAFT',
      },
      include: { analytics: true },
    });
  }

  async findAll(page: number, limit: number, status?: string) {
    const where: Prisma.CampaignWhereInput = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { analytics: true },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total };
  }

  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        analytics: true,
        recipients: {
          take: 20,
          include: { customer: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  async update(id: string, data: Partial<CreateCampaignDto>) {
    return prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        segmentRules: data.segmentRules as Prisma.InputJsonValue | undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { analytics: true },
    });
  }

  async launch(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING', launchedAt: new Date() },
    });
  }

  async pause(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resume(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async stop(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
  }

  async complete(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  async delete(id: string) {
    return prisma.campaign.delete({
      where: { id },
    });
  }

  async createRecipients(
    campaignId: string,
    recipients: Array<{ customerId: string; personalizedMsg?: string }>,
  ) {
    return prisma.campaignRecipient.createMany({
      data: recipients.map((r) => ({
        campaignId,
        customerId: r.customerId,
        personalizedMsg: r.personalizedMsg,
        status: 'PENDING',
      })),
      skipDuplicates: true,
    });
  }

  async findRecipients(campaignId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [recipients, total] = await Promise.all([
      prisma.campaignRecipient.findMany({
        where: { campaignId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          customer: { select: { id: true, name: true, email: true, city: true } },
        },
      }),
      prisma.campaignRecipient.count({ where: { campaignId } }),
    ]);
    return { recipients, total };
  }

  async findRecentEvents(campaignId: string, limit = 50) {
    return prisma.communicationEvent.findMany({
      where: { campaignId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }
}
