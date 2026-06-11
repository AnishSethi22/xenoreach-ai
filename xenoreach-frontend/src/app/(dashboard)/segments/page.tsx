'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AudiencePreview, SegmentRule, ConditionOperator, SegmentCondition } from '@/types/campaign.types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { Filter, Play, Sparkles, Users, ChevronDown, ChevronUp } from 'lucide-react';

const FIELD_OPTIONS = [
  { value: 'total_spend', label: 'Total Spend (₹)', type: 'number' },
  { value: 'order_count', label: 'Order Count', type: 'number' },
  { value: 'avg_order_value', label: 'Avg Order Value (₹)', type: 'number' },
  { value: 'days_since_last', label: 'Days Since Last Order', type: 'number' },
  { value: 'engagement_score', label: 'Engagement Score (0-100)', type: 'number' },
  { value: 'churn_probability', label: 'Churn Probability (0-1)', type: 'number' },
  { value: 'loyalty_tier', label: 'Loyalty Tier', type: 'select', options: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] },
  { value: 'loyalty_points', label: 'Loyalty Points', type: 'number' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'] },
  { value: 'rfm_segment', label: 'RFM Segment', type: 'select', options: ['Champions', 'Loyal Customers', 'Potential Loyalists', 'At Risk', 'Hibernating', 'Lost'] },
];

const OPERATOR_OPTIONS = [
  { value: 'gte', label: '≥ (at least)' },
  { value: 'lte', label: '≤ (at most)' },
  { value: 'gt', label: '> (greater than)' },
  { value: 'lt', label: '< (less than)' },
  { value: 'eq', label: '= (equals)' },
  { value: 'neq', label: '≠ (not equal)' },
  { value: 'contains', label: 'contains' },
];

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const PRESET_SEGMENTS = [
  {
    label: 'High-Value Dormant',
    icon: '💤',
    description: 'Customers who spent well but haven\'t ordered recently',
    rules: {
      operator: 'AND' as const,
      conditions: [
        { field: 'total_spend', operator: 'gte', value: 5000 },
        { field: 'days_since_last', operator: 'gte', value: 45 },
      ],
    },
  },
  {
    label: 'Champions',
    icon: '🏆',
    description: 'Top RFM segment — best customers',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'rfm_segment', operator: 'eq', value: 'Champions' }],
    },
  },
  {
    label: 'Churn Risk',
    icon: '⚠️',
    description: 'High churn probability with spend history',
    rules: {
      operator: 'AND' as const,
      conditions: [
        { field: 'churn_probability', operator: 'gte', value: 0.6 },
        { field: 'total_spend', operator: 'gte', value: 2000 },
      ],
    },
  },
  {
    label: 'New Loyal',
    icon: '🌟',
    description: 'Low days since last order, high engagement',
    rules: {
      operator: 'AND' as const,
      conditions: [
        { field: 'days_since_last', operator: 'lte', value: 15 },
        { field: 'engagement_score', operator: 'gte', value: 65 },
      ],
    },
  },
];

export default function SegmentsPage() {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'total_spend', operator: 'gte', value: '1000' },
  ]);
  const [groupOperator, setGroupOperator] = useState<'AND' | 'OR'>('AND');
  const [preview, setPreview] = useState<AudiencePreview | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  const { mutate: fetchPreview, isPending } = useMutation({
    mutationFn: (rules: SegmentRule) =>
      api.post<AudiencePreview>('/segments/preview', { rules }),
    onSuccess: (data) => setPreview(data),
  });

  function addCondition() {
    setConditions((prev) => [
      ...prev,
      { id: String(Date.now()), field: 'total_spend', operator: 'gte', value: '' },
    ]);
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCondition(id: string, key: keyof Condition, val: string) {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
  }

  function buildRules(): SegmentRule {
    return {
      operator: groupOperator,
      conditions: conditions.map((c) => {
        const numVal = parseFloat(c.value);
        return {
          field: c.field,
          operator: c.operator as ConditionOperator,
          value: isNaN(numVal) ? c.value : numVal,
        } as SegmentCondition;
      }),
    };
  }

  function applyPreset(preset: typeof PRESET_SEGMENTS[0]) {
    setConditions(
      preset.rules.conditions.map((cond, i) => ({
        id: String(i + 1),
        field: cond.field,
        operator: cond.operator,
        value: String(cond.value),
      })),
    );
    setGroupOperator(preset.rules.operator);
    setPreview(null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white">Audience Segments</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Build and preview customer segments using visual rules
        </p>
      </div>

      <div className="glass-card p-5">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 text-sm font-medium mb-3 text-white w-full text-left"
        >
          <Sparkles size={14} style={{ color: '#A78BFA' }} />
          Preset Segments
          {showPresets ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.4)' }} /> : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
        </button>
        {showPresets && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_SEGMENTS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-xl text-left transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-xl mb-2">{preset.icon}</div>
                <div className="text-sm font-medium text-white">{preset.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{preset.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Filter size={14} style={{ color: '#A78BFA' }} />
            Segment Builder
          </h2>
          <div className="flex gap-2">
            {(['AND', 'OR'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setGroupOperator(op)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: groupOperator === op ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${groupOperator === op ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: groupOperator === op ? '#A78BFA' : 'rgba(255,255,255,0.5)',
                }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {conditions.map((cond, i) => {
            const fieldConfig = FIELD_OPTIONS.find((f) => f.value === cond.field);
            return (
              <div key={cond.id} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', flexShrink: 0 }}
                  >
                    {groupOperator}
                  </span>
                )}
                <select
                  className="input-field text-sm"
                  value={cond.field}
                  onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {FIELD_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: '#111' }}>{f.label}</option>
                  ))}
                </select>
                <select
                  className="input-field text-sm"
                  value={cond.operator}
                  onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', width: 160 }}
                >
                  {OPERATOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} style={{ background: '#111' }}>{o.label}</option>
                  ))}
                </select>
                {fieldConfig?.type === 'select' ? (
                  <select
                    className="input-field text-sm"
                    value={cond.value}
                    onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {fieldConfig.options?.map((opt) => (
                      <option key={opt} value={opt} style={{ background: '#111' }}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input-field text-sm"
                    placeholder="Value..."
                    value={cond.value}
                    onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                  />
                )}
                {conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(cond.id)}
                    className="text-xs px-2 py-1 rounded transition-all flex-shrink-0"
                    style={{ color: '#F43F5E', background: 'rgba(244, 63, 94, 0.1)' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={addCondition} className="btn-secondary text-sm">
            + Add Condition
          </button>
          <button
            onClick={() => fetchPreview(buildRules())}
            disabled={isPending}
            className="btn-primary text-sm"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {isPending ? 'Calculating...' : 'Preview Audience'}
          </button>
        </div>
      </div>

      {preview && (
        <div
          className="glass-card p-5 animate-slide-up"
          style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users size={18} style={{ color: '#10B981' }} />
            <div>
              <div className="text-xl font-bold text-white">{formatNumber(preview.count)}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>customers match this segment</div>
            </div>
          </div>
          {preview.sample.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Sample Customers</div>
              <div className="space-y-2">
                {preview.sample.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white">{c.name}</span>
                      <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.city}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span>{formatCurrency(c.metrics?.totalSpend)}</span>
                      <span>{c.metrics?.loyaltyTier}</span>
                      <span>{formatPercent(c.metrics?.churnProbability, 0)} churn</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
