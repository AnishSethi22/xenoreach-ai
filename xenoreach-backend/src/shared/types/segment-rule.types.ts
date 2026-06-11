export type SegmentOperator = 'AND' | 'OR';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains';

export type SegmentField =
  | 'total_spend'
  | 'order_count'
  | 'avg_order_value'
  | 'days_since_last'
  | 'engagement_score'
  | 'churn_probability'
  | 'loyalty_tier'
  | 'loyalty_points'
  | 'city'
  | 'state'
  | 'gender'
  | 'rfm_segment'
  | 'purchase_propensity';

export interface SegmentCondition {
  field: SegmentField;
  operator: ConditionOperator;
  value: string | number | string[];
}

export interface SegmentGroup {
  operator: SegmentOperator;
  conditions: (SegmentCondition | SegmentGroup)[];
}

export type SegmentRule = SegmentGroup;

export function isSegmentGroup(
  rule: SegmentCondition | SegmentGroup,
): rule is SegmentGroup {
  return 'conditions' in rule && 'operator' in rule;
}
