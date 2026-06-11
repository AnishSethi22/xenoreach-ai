export interface OverviewMetrics {
  totalCustomers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalMessagesSent: number;
  overallDeliveryRate: number;
  overallOpenRate: number;
  overallClickRate: number;
  overallConversionRate: number;
  totalRevenueAttributed: string | null;
  totalCustomerRevenue: string | null;
  avgChurnProbability: string | null;
  avgEngagementScore: string | null;
}

export interface ChannelPerformance {
  channel: string;
  campaignCount: number;
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenueAttributed: number;
}

export interface TrendDataPoint {
  date: string;
  SENT?: number;
  DELIVERED?: number;
  OPENED?: number;
  CLICKED?: number;
  CONVERTED?: number;
}

export interface RevenueBreakdown {
  id: string;
  name: string;
  channel: string;
  revenue: number;
  conversions: number;
  completedAt: string | null;
}

export interface AudienceHealth {
  loyaltyTiers: Array<{
    loyaltyTier: string;
    _count: number;
    _avg: { totalSpend: string | null; engagementScore: string | null };
  }>;
  rfmSegments: Array<{
    rfmSegment: string | null;
    _count: number;
  }>;
  churnRisk: {
    _count: number;
    _avg: { totalSpend: string | null };
  };
}

export interface AiInsight {
  id: string;
  type: 'CHANNEL_PERFORMANCE' | 'AUDIENCE_OPPORTUNITY' | 'CHURN_RISK' | 'RETENTION' | 'GENERAL';
  title: string;
  body: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  metadata: Record<string, unknown>;
  expiresAt: string | null;
  createdAt: string;
}
