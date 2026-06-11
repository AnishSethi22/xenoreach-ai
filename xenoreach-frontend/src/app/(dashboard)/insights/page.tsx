'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AiInsight } from '@/types/analytics.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle, Trophy, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  CHANNEL_PERFORMANCE: TrendingUp,
  AUDIENCE_OPPORTUNITY: Users,
  CHURN_RISK: AlertCircle,
  RETENTION: Trophy,
  GENERAL: Lightbulb,
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'High Priority', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.08)' },
  MEDIUM: { label: 'Medium Priority', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  LOW: { label: 'Low Priority', color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
};

export default function InsightsPage() {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => api.get<AiInsight[]>('/ai/insights'),
  });

  const { mutate: refresh, isPending: isRefreshing } = useMutation({
    mutationFn: () => api.post('/ai/insights/refresh', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] }),
  });

  const highPriority = (insights as AiInsight[] | undefined)?.filter((i) => i.priority === 'HIGH') || [];
  const rest = (insights as AiInsight[] | undefined)?.filter((i) => i.priority !== 'HIGH') || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles size={18} style={{ color: '#A78BFA' }} />
            AI Insights
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Proactive recommendations generated from your CRM data
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={isRefreshing}
          className="btn-secondary text-sm"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      {highPriority.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#F43F5E' }}>
            ⚡ High Priority
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {highPriority.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Other Insights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rest.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!insights || (insights as AiInsight[]).length === 0) && (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
          >
            <Sparkles size={22} style={{ color: '#A78BFA' }} />
          </div>
          <div className="text-white font-medium">No insights yet</div>
          <div className="text-sm mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Click Refresh to generate AI insights from your data
          </div>
          <button onClick={() => refresh()} className="btn-primary mx-auto">
            <Sparkles size={14} /> Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: AiInsight }) {
  const config = PRIORITY_CONFIG[insight.priority];
  const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;

  return (
    <div
      className="glass-card p-5 space-y-3 transition-all hover:border-violet-500/30"
      style={{ background: config.bg, borderColor: `${config.color}20` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
          >
            <Icon size={16} style={{ color: config.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{insight.title}</div>
            <div className="text-xs mt-0.5" style={{ color: config.color }}>{config.label}</div>
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-mono"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
        >
          {insight.type.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {insight.body}
      </p>
      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {timeAgo(insight.createdAt)}
      </div>
    </div>
  );
}
