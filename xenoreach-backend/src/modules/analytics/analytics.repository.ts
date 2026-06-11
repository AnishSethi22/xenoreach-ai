import { prisma } from '../../config/database';

export class AnalyticsRepository {
  async getOverview() {
    const [
      totalCustomers,
      totalCampaigns,
      activeCampaigns,
      analyticsAgg,
      customerMetricsAgg,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'RUNNING' } }),
      prisma.campaignAnalytics.aggregate({
        _sum: {
          totalRecipients: true,
          deliveredCount: true,
          openedCount: true,
          clickedCount: true,
          convertedCount: true,
          revenueAttributed: true,
        },
      }),
      prisma.customerMetrics.aggregate({
        _avg: { churnProbability: true, engagementScore: true },
        _sum: { totalSpend: true },
      }),
    ]);

    const sent = analyticsAgg._sum.totalRecipients || 0;
    const delivered = analyticsAgg._sum.deliveredCount || 0;
    const opened = analyticsAgg._sum.openedCount || 0;
    const clicked = analyticsAgg._sum.clickedCount || 0;
    const converted = analyticsAgg._sum.convertedCount || 0;

    return {
      totalCustomers,
      totalCampaigns,
      activeCampaigns,
      totalMessagesSent: sent,
      overallDeliveryRate: sent > 0 ? delivered / sent : 0,
      overallOpenRate: delivered > 0 ? opened / delivered : 0,
      overallClickRate: delivered > 0 ? clicked / delivered : 0,
      overallConversionRate: delivered > 0 ? converted / delivered : 0,
      totalRevenueAttributed: analyticsAgg._sum.revenueAttributed,
      totalCustomerRevenue: customerMetricsAgg._sum.totalSpend,
      avgChurnProbability: customerMetricsAgg._avg.churnProbability,
      avgEngagementScore: customerMetricsAgg._avg.engagementScore,
    };
  }

  async getCampaignComparison(limit = 10) {
    return prisma.campaign.findMany({
      take: limit,
      orderBy: { launchedAt: 'desc' },
      where: { status: { in: ['RUNNING', 'COMPLETED', 'PAUSED'] } },
      include: { analytics: true },
    });
  }

  async getChannelPerformance() {
    const campaigns = await prisma.campaign.findMany({
      where: { status: { in: ['COMPLETED', 'RUNNING'] } },
      include: { analytics: true },
    });

    const channelMap: Record<string, {
      count: number;
      totalSent: number;
      totalDelivered: number;
      totalOpened: number;
      totalClicked: number;
      totalConverted: number;
      totalRevenue: number;
    }> = {};

    for (const campaign of campaigns) {
      const ch = campaign.channel;
      if (!channelMap[ch]) {
        channelMap[ch] = {
          count: 0, totalSent: 0, totalDelivered: 0,
          totalOpened: 0, totalClicked: 0, totalConverted: 0, totalRevenue: 0,
        };
      }
      channelMap[ch].count += 1;
      channelMap[ch].totalSent += campaign.analytics?.totalRecipients || 0;
      channelMap[ch].totalDelivered += campaign.analytics?.deliveredCount || 0;
      channelMap[ch].totalOpened += campaign.analytics?.openedCount || 0;
      channelMap[ch].totalClicked += campaign.analytics?.clickedCount || 0;
      channelMap[ch].totalConverted += campaign.analytics?.convertedCount || 0;
      channelMap[ch].totalRevenue += Number(campaign.analytics?.revenueAttributed || 0);
    }

    return Object.entries(channelMap).map(([channel, data]) => ({
      channel,
      campaignCount: data.count,
      totalSent: data.totalSent,
      deliveryRate: data.totalSent > 0 ? data.totalDelivered / data.totalSent : 0,
      openRate: data.totalDelivered > 0 ? data.totalOpened / data.totalDelivered : 0,
      clickRate: data.totalDelivered > 0 ? data.totalClicked / data.totalDelivered : 0,
      conversionRate: data.totalDelivered > 0 ? data.totalConverted / data.totalDelivered : 0,
      revenueAttributed: data.totalRevenue,
    }));
  }

  async getTrends(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await prisma.communicationEvent.findMany({
      where: { occurredAt: { gte: since } },
      select: { eventType: true, occurredAt: true },
      orderBy: { occurredAt: 'asc' },
    });

    const byDay: Record<string, Record<string, number>> = {};

    for (const event of events) {
      const day = event.occurredAt.toISOString().split('T')[0];
      if (!byDay[day]) byDay[day] = { SENT: 0, DELIVERED: 0, OPENED: 0, CLICKED: 0, CONVERTED: 0 };
      byDay[day][event.eventType] = (byDay[day][event.eventType] || 0) + 1;
    }

    return Object.entries(byDay).map(([date, counts]) => ({ date, ...counts }));
  }

  async getRevenueBreakdown() {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'COMPLETED',
        analytics: { revenueAttributed: { gt: 0 } },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: { analytics: true },
    });

    return campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      revenue: Number(c.analytics?.revenueAttributed || 0),
      conversions: c.analytics?.convertedCount || 0,
      completedAt: c.completedAt,
    }));
  }

  async getAudienceHealth() {
    const [loyaltyTiers, rfmSegments, churnRisk] = await Promise.all([
      prisma.customerMetrics.groupBy({
        by: ['loyaltyTier'],
        _count: true,
        _avg: { totalSpend: true, engagementScore: true },
      }),
      prisma.customerMetrics.groupBy({
        by: ['rfmSegment'],
        _count: true,
      }),
      prisma.customerMetrics.aggregate({
        where: { churnProbability: { gte: 0.6 } },
        _count: true,
        _avg: { totalSpend: true },
      }),
    ]);

    return { loyaltyTiers, rfmSegments, churnRisk };
  }
}
