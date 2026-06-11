import { Prisma } from '@prisma/client';
import {
  SegmentRule,
  SegmentCondition,
  SegmentGroup,
  isSegmentGroup,
  ConditionOperator,
} from '../../shared/types/segment-rule.types';

type PrismaWhereClause = Prisma.CustomerWhereInput;

const METRICS_FIELDS = new Set([
  'total_spend',
  'order_count',
  'avg_order_value',
  'days_since_last',
  'engagement_score',
  'churn_probability',
  'loyalty_tier',
  'loyalty_points',
  'rfm_segment',
  'purchase_propensity',
  'recency_score',
  'frequency_score',
  'monetary_score',
]);

const CUSTOMER_FIELDS = new Set(['city', 'state', 'gender']);

function mapField(field: string): { relation: 'metrics' | 'customer'; column: string } {
  if (METRICS_FIELDS.has(field)) {
    const columnMap: Record<string, string> = {
      total_spend: 'totalSpend',
      order_count: 'orderCount',
      avg_order_value: 'avgOrderValue',
      days_since_last: 'daysSinceLast',
      engagement_score: 'engagementScore',
      churn_probability: 'churnProbability',
      loyalty_tier: 'loyaltyTier',
      loyalty_points: 'loyaltyPoints',
      rfm_segment: 'rfmSegment',
      purchase_propensity: 'purchasePropensity',
      recency_score: 'recencyScore',
      frequency_score: 'frequencyScore',
      monetary_score: 'monetaryScore',
    };
    return { relation: 'metrics', column: columnMap[field] || field };
  }
  if (CUSTOMER_FIELDS.has(field)) {
    return { relation: 'customer', column: field };
  }
  return { relation: 'customer', column: field };
}

function buildPrismaOperator(operator: ConditionOperator, value: unknown): Record<string, unknown> {
  switch (operator) {
    case 'eq':
      return { equals: value };
    case 'neq':
      return { not: value };
    case 'gt':
      return { gt: value };
    case 'gte':
      return { gte: value };
    case 'lt':
      return { lt: value };
    case 'lte':
      return { lte: value };
    case 'in':
      return { in: Array.isArray(value) ? value : [value] };
    case 'not_in':
      return { notIn: Array.isArray(value) ? value : [value] };
    case 'contains':
      return { contains: value, mode: 'insensitive' };
    default:
      return { equals: value };
  }
}

function buildConditionWhere(condition: SegmentCondition): PrismaWhereClause {
  const { relation, column } = mapField(condition.field);
  const prismaOp = buildPrismaOperator(condition.operator, condition.value);

  if (relation === 'metrics') {
    return {
      metrics: {
        [column]: prismaOp,
      },
    };
  }

  return {
    [column]: prismaOp,
  };
}

function buildGroupWhere(group: SegmentGroup): PrismaWhereClause {
  if (!group || !group.conditions || !Array.isArray(group.conditions)) {
    return {};
  }

  const clauses = group.conditions.map((item) => {
    if (isSegmentGroup(item)) {
      return buildGroupWhere(item);
    }
    return buildConditionWhere(item);
  });

  if (clauses.length === 0) {
    return {};
  }

  if (group.operator === 'AND') {
    return { AND: clauses };
  }

  return { OR: clauses };
}

export function buildSegmentQuery(rules: SegmentRule): PrismaWhereClause {
  if (!rules || Object.keys(rules).length === 0) {
    return {};
  }
  return buildGroupWhere(rules);
}
