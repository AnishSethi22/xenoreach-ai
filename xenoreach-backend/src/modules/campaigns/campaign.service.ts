import { CampaignRepository } from './campaign.repository';
import { SegmentService } from '../segments/segment.service';
import { AppError } from '../../middleware/error.middleware';
import { paginatedResponse } from '../../shared/types/api-response.types';
import { CreateCampaignDto, UpdateCampaignDto } from './campaign.dto';
import { simulateCampaignDelivery } from '../channel/channel.simulator';
import { SegmentRule } from '../../shared/types/segment-rule.types';

const repo = new CampaignRepository();
const segmentService = new SegmentService();

export class CampaignService {
  async create(dto: CreateCampaignDto) {
    const customerIds = await segmentService.getCustomerIds(dto.segmentRules as unknown as SegmentRule);

    const campaign = await repo.create({
      ...dto,
      audienceSize: customerIds.length,
    });

    return campaign;
  }

  async findAll(page: number, limit: number, status?: string) {
    const { campaigns, total } = await repo.findAll(page, limit, status);
    return paginatedResponse(campaigns, total, page, limit);
  }

  async findById(id: string) {
    try {
      const campaign = await repo.findById(id);
      if (!campaign) throw new AppError('Campaign not found', 404);
      return campaign;
    } catch (err: any) {
      // Prisma throws P2023 for invalid UUID format, P2025 for record not found
      if (err?.code === 'P2023' || err?.code === 'P2025') {
        throw new AppError('Campaign not found', 404);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status !== 'DRAFT') {
      throw new AppError('Only draft campaigns can be updated', 400);
    }
    return repo.update(id, dto);
  }

  async launch(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (!['DRAFT', 'PAUSED'].includes(campaign.status)) {
      throw new AppError('Campaign cannot be launched from its current status', 400);
    }

    const customerIds = await segmentService.getCustomerIds(
      campaign.segmentRules as unknown as SegmentRule,
    );

    if (customerIds.length === 0) {
      throw new AppError('No customers match the audience criteria', 400);
    }

    const recipients = customerIds.map((customerId) => ({
      customerId,
      personalizedMsg: campaign.messageTemplate,
    }));

    await repo.createRecipients(id, recipients);
    await repo.launch(id);

    setImmediate(() => {
      simulateCampaignDelivery(id, campaign.channel).catch((err) =>
        console.error('[CampaignService] Simulation error:', err),
      );
    });

    return { launched: true, recipientCount: customerIds.length };
  }

  async pause(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status !== 'RUNNING') {
      throw new AppError('Only running campaigns can be paused', 400);
    }
    return repo.pause(id);
  }

  async resume(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status !== 'PAUSED') {
      throw new AppError('Only paused campaigns can be resumed', 400);
    }
    const result = await repo.resume(id);
    setImmediate(() => {
      simulateCampaignDelivery(id, campaign.channel).catch((err) =>
        console.error('[CampaignService] Simulation error on resume:', err),
      );
    });
    return result;
  }

  async stop(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (!['RUNNING', 'PAUSED'].includes(campaign.status)) {
      throw new AppError('Only running or paused campaigns can be stopped', 400);
    }
    return repo.stop(id);
  }

  async complete(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (!['RUNNING', 'PAUSED'].includes(campaign.status)) {
      throw new AppError('Only running or paused campaigns can be completed', 400);
    }
    return repo.complete(id);
  }

  async delete(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    if (campaign.status !== 'DRAFT') {
      throw new AppError('Only draft campaigns can be deleted', 400);
    }
    return repo.delete(id);
  }

  async duplicate(id: string) {
    const campaign = await repo.findById(id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    
    return repo.create({
      name: `${campaign.name} (Copy)`,
      description: campaign.description || '',
      goal: campaign.goal,
      channel: campaign.channel as 'WHATSAPP' | 'EMAIL' | 'SMS' | 'RCS',
      segmentRules: campaign.segmentRules as any,
      audienceSize: campaign.audienceSize,
      messageTemplate: campaign.messageTemplate,
      subjectLine: campaign.subjectLine || '',
      aiReasoning: campaign.aiReasoning || '',
    });
  }

  async getRecipients(campaignId: string, page: number, limit: number) {
    const campaign = await repo.findById(campaignId);
    if (!campaign) throw new AppError('Campaign not found', 404);
    const { recipients, total } = await repo.findRecipients(campaignId, page, limit);
    return paginatedResponse(recipients, total, page, limit);
  }

  async getRecentEvents(campaignId: string) {
    const campaign = await repo.findById(campaignId);
    if (!campaign) throw new AppError('Campaign not found', 404);
    return repo.findRecentEvents(campaignId);
  }
}
