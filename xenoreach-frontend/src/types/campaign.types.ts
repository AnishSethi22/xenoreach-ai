export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type CampaignChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'RCS';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  goal: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  segmentRules: SegmentRule;
  audienceSize: number;
  messageTemplate: string;
  subjectLine: string | null;
  aiReasoning: string | null;
  scheduledAt: string | null;
  launchedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  analytics: CampaignAnalytics | null;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  readCount: number;
  clickedCount: number;
  convertedCount: number;
  revenueAttributed: string;
  deliveryRate: string;
  openRate: string;
  clickRate: string;
  conversionRate: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  customerId: string;
  personalizedMsg: string | null;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    city: string | null;
  };
}

export interface CommunicationEvent {
  id: string;
  recipientId: string;
  campaignId: string;
  customerId: string;
  eventType: string;
  channel: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  customer?: {
    id: string;
    name: string;
  };
  campaign?: {
    id: string;
    name: string;
    channel: string;
  };
}

export type SegmentOperator = 'AND' | 'OR';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains';

export interface SegmentCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | string[];
}

export interface SegmentGroup {
  operator: SegmentOperator;
  conditions: (SegmentCondition | SegmentGroup)[];
}

export type SegmentRule = SegmentGroup;

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  rules: SegmentRule;
  customerCount: number;
  isDynamic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudiencePreview {
  count: number;
  sample: Array<{
    id: string;
    name: string;
    email: string | null;
    city: string | null;
    metrics: {
      totalSpend: string;
      orderCount: number;
      loyaltyTier: string;
      daysSinceLast: number | null;
      churnProbability: string;
    } | null;
  }>;
}

export interface CampaignBuilderState {
  goal: string;
  segmentRules: SegmentRule | null;
  aiReasoning: string | null;
  estimatedImpact: string | null;
  audiencePreview: AudiencePreview | null;
  messageTemplate: string;
  subjectLine: string;
  channel: CampaignChannel;
  name: string;
  description: string;
}
