import { z } from 'zod';

export const createCampaignDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().min(1),
  channel: z.union([
    z.literal('WHATSAPP'),
    z.literal('EMAIL'),
    z.literal('SMS'),
    z.literal('RCS'),
  ]),
  segmentRules: z.record(z.string(), z.unknown()),
  audienceSize: z.number().int().default(0),
  messageTemplate: z.string().min(1),
  subjectLine: z.string().optional(),
  aiReasoning: z.string().optional(),
  scheduledAt: z.string().optional(),
});

export const updateCampaignDto = createCampaignDto.partial();

export type CreateCampaignDto = z.infer<typeof createCampaignDto>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignDto>;
