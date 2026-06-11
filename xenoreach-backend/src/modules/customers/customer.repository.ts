import { prisma } from '../../config/database';
import { PaginationQuery } from '../../shared/types/api-response.types';
import { Prisma } from '@prisma/client';

export class CustomerRepository {
  async findAll(pagination: PaginationQuery, filters: {
    city?: string;
    loyaltyTier?: string;
    rfmSegment?: string;
    minSpend?: number;
    maxSpend?: number;
  } = {}) {
    const { page, limit, search, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
              ],
            }
          : {},
        filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {},
        filters.loyaltyTier
          ? { metrics: { loyaltyTier: filters.loyaltyTier } }
          : {},
        filters.rfmSegment
          ? { metrics: { rfmSegment: filters.rfmSegment } }
          : {},
        filters.minSpend !== undefined
          ? { metrics: { totalSpend: { gte: filters.minSpend } } }
          : {},
        filters.maxSpend !== undefined
          ? { metrics: { totalSpend: { lte: filters.maxSpend } } }
          : {},
      ],
    };

    const orderByMap: Record<string, Prisma.CustomerOrderByWithRelationInput> = {
      name: { name: sortOrder },
      email: { email: sortOrder },
      totalSpend: { metrics: { totalSpend: sortOrder } },
      orderCount: { metrics: { orderCount: sortOrder } },
      daysSinceLast: { metrics: { daysSinceLast: sortOrder } },
      churnProbability: { metrics: { churnProbability: sortOrder } },
      engagementScore: { metrics: { engagementScore: sortOrder } },
      createdAt: { createdAt: sortOrder },
    };

    const orderBy = sortBy && orderByMap[sortBy]
      ? orderByMap[sortBy]
      : { createdAt: 'desc' as const };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { metrics: true },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        metrics: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true },
        },
      },
    });
  }

  async findOrderHistory(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where: { customerId } }),
    ]);
    return { orders, total };
  }

  async findCommunicationHistory(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.communicationEvent.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
        include: {
          campaign: { select: { id: true, name: true, channel: true } },
        },
      }),
      prisma.communicationEvent.count({ where: { customerId } }),
    ]);
    return { events, total };
  }

  async getMetricsSummary() {
    const [totalCustomers, metrics] = await Promise.all([
      prisma.customer.count(),
      prisma.customerMetrics.aggregate({
        _avg: {
          totalSpend: true,
          engagementScore: true,
          churnProbability: true,
          orderCount: true,
        },
        _sum: {
          totalSpend: true,
        },
      }),
    ]);

    const loyaltyTierCounts = await prisma.customerMetrics.groupBy({
      by: ['loyaltyTier'],
      _count: true,
    });

    const rfmSegmentCounts = await prisma.customerMetrics.groupBy({
      by: ['rfmSegment'],
      _count: true,
    });

    const churnRiskCount = await prisma.customerMetrics.count({
      where: { churnProbability: { gte: 0.6 } },
    });

    return {
      totalCustomers,
      avgTotalSpend: metrics._avg.totalSpend,
      avgEngagementScore: metrics._avg.engagementScore,
      avgChurnProbability: metrics._avg.churnProbability,
      avgOrderCount: metrics._avg.orderCount,
      totalRevenue: metrics._sum.totalSpend,
      loyaltyTierCounts,
      rfmSegmentCounts,
      churnRiskCount,
    };
  }
}
