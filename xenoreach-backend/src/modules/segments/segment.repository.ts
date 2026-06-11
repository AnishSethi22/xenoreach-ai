import { prisma } from '../../config/database';
import { buildSegmentQuery } from './segment.query-builder';
import { SegmentRule } from '../../shared/types/segment-rule.types';
import { Prisma } from '@prisma/client';

export class SegmentRepository {
  async previewAudience(rules: SegmentRule): Promise<{
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
  }> {
    const where = buildSegmentQuery(rules);

    const [count, sample] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          metrics: {
            select: {
              totalSpend: true,
              orderCount: true,
              loyaltyTier: true,
              daysSinceLast: true,
              churnProbability: true,
            },
          },
        },
      }),
    ]);

    return {
      count,
      sample: sample.map((c) => ({
        ...c,
        metrics: c.metrics
          ? {
              totalSpend: c.metrics.totalSpend.toString(),
              orderCount: c.metrics.orderCount,
              loyaltyTier: c.metrics.loyaltyTier,
              daysSinceLast: c.metrics.daysSinceLast,
              churnProbability: c.metrics.churnProbability.toString(),
            }
          : null,
      })),
    };
  }

  async getCustomerIdsByRules(rules: SegmentRule): Promise<string[]> {
    const where = buildSegmentQuery(rules);
    const customers = await prisma.customer.findMany({
      where,
      select: { id: true },
    });
    return customers.map((c) => c.id);
  }

  async create(data: {
    name: string;
    description?: string;
    rules: SegmentRule;
    isDynamic: boolean;
    customerCount: number;
  }) {
    return prisma.segment.create({
      data: {
        name: data.name,
        description: data.description,
        rules: data.rules as unknown as Prisma.InputJsonValue,
        isDynamic: data.isDynamic,
        customerCount: data.customerCount,
      },
    });
  }

  async findAll() {
    return prisma.segment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.segment.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.segment.delete({ where: { id } });
  }
}
