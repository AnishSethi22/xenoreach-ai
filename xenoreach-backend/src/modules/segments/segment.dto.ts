import { z } from 'zod';

const conditionSchema: z.ZodType<object> = z.lazy(() =>
  z.union([
    z.object({
      field: z.enum([
        'total_spend', 'order_count', 'avg_order_value', 'days_since_last',
        'engagement_score', 'churn_probability', 'loyalty_tier', 'loyalty_points',
        'city', 'state', 'gender', 'rfm_segment', 'purchase_propensity',
      ]),
      operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains']),
      value: z.union([z.string(), z.number(), z.array(z.string())]),
    }),
    z.object({
      operator: z.enum(['AND', 'OR']),
      conditions: z.array(z.lazy(() => conditionSchema)),
    }),
  ])
);

export const segmentRuleSchema = z.object({
  operator: z.enum(['AND', 'OR']),
  conditions: z.array(conditionSchema),
});

export const previewSegmentDto = z.object({
  rules: segmentRuleSchema,
});

export const createSegmentDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  rules: segmentRuleSchema,
  isDynamic: z.boolean().default(true),
});

export type PreviewSegmentDto = z.infer<typeof previewSegmentDto>;
export type CreateSegmentDto = z.infer<typeof createSegmentDto>;
