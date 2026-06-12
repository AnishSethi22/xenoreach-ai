'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { OverviewMetrics, ChannelPerformance, AiInsight } from '@/types/analytics.types';
import { Campaign } from '@/types/campaign.types';
import { formatCurrency, formatPercent, formatNumber, timeAgo, CHANNEL_COLORS, STATUS_COLORS } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Users, Megaphone, TrendingUp, ArrowUpRight, Zap, Sparkles,
  MessageSquare, Mail, Phone, Radio, AlertCircle, Trophy, ChevronRight, RefreshCw
} from 'lucide-react';
import { PaginatedResponse } from '@/types/common.types';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

function MetricCard({
  title, value, subtitle, icon: Icon, trend, color = '#8B5CF6',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
          >
            <ArrowUpRight size={11} />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{subtitle}</div>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="metric-card">
      <div className="skeleton w-10 h-10 rounded-xl mb-4" />
      <div className="skeleton h-7 w-24 mb-2" />
      <div className="skeleton h-4 w-32" />
    </div>
  );
}

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  SMS: Phone,
  RCS: Radio,
};

export default function OverviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get<OverviewMetrics>('/analytics/overview'),
  });

  const { data: channels } = useQuery({
    queryKey: ['analytics', 'channels'],
    queryFn: () => api.get<ChannelPerformance[]>('/analytics/channels'),
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get<{ data: Campaign[] }>('/campaigns?limit=5'),
  });

  const { data: insights } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => api.get<AiInsight[]>('/ai/insights'),
  });

  const { data: trends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => api.get<Array<{ date: string; SENT?: number; DELIVERED?: number; OPENED?: number; CONVERTED?: number }>>('/analytics/trends?days=14'),
  });

  const recentCampaigns = (campaigns as { data?: Campaign[] } | undefined)?.data || [];
  const topInsights = (insights as AiInsight[] | undefined)?.slice(0, 3) || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    await queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Platform Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Real-time performance across all campaigns and channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => router.push('/campaigns/new')}
            className="btn-primary text-sm"
          >
            <Zap size={14} />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              title="Total Customers"
              value={formatNumber(overview?.totalCustomers)}
              icon={Users}
              color="#8B5CF6"
              trend="+12%"
            />
            <MetricCard
              title="Revenue Attributed"
              value={formatCurrency(overview?.totalRevenueAttributed)}
              icon={TrendingUp}
              color="#10B981"
              trend="+8%"
            />
            <MetricCard
              title="Active Campaigns"
              value={String(overview?.activeCampaigns || 0)}
              subtitle={`of ${overview?.totalCampaigns || 0} total`}
              icon={Megaphone}
              color="#F59E0B"
            />
            <MetricCard
              title="Avg Conversion Rate"
              value={formatPercent(overview?.overallConversionRate)}
              subtitle="Platform-wide"
              icon={ArrowUpRight}
              color="#0EA5E9"
              trend="+2.1%"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Message Volume — Last 14 Days</h2>
          </div>
          {trends ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trends as Array<Record<string, number | string>>}>
                <defs>
                  <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="SENT" stroke="#8B5CF6" fill="url(#gradSent)" strokeWidth={2} name="Sent" />
                <Area type="monotone" dataKey="DELIVERED" stroke="#10B981" fill="url(#gradDelivered)" strokeWidth={2} name="Delivered" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-44 rounded-lg" />
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Channel Performance</h2>
          <div className="space-y-3">
            {channels
              ? (channels as ChannelPerformance[]).map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.channel] || MessageSquare;
                  const color = CHANNEL_COLORS[ch.channel] || '#8B5CF6';
                  return (
                    <div key={ch.channel} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-white">{ch.channel}</span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {formatPercent(ch.openRate)} open
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${ch.openRate * 100}%`, background: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              : Array(4).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="skeleton h-3 w-24 rounded" />
                      <div className="skeleton h-1.5 rounded-full" />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Campaigns</h2>
            <button
              onClick={() => router.push('/campaigns')}
              className="text-xs flex items-center gap-1"
              style={{ color: '#A78BFA' }}
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentCampaigns.length > 0
              ? recentCampaigns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/campaigns/${c.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all table-row"
                    style={{ border: '1px solid transparent' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{c.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {c.channel} · {formatNumber(c.audienceSize)} recipients · {timeAgo(c.createdAt)}
                      </div>
                    </div>
                    <span className={`status-badge ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </button>
                ))
              : Array(3).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-4 w-40 rounded" />
                      <div className="skeleton h-3 w-28 rounded" />
                    </div>
                    <div className="skeleton h-5 w-20 rounded-full" />
                  </div>
                ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={14} style={{ color: '#A78BFA' }} />
              AI Insights
            </h2>
            <button
              onClick={() => router.push('/insights')}
              className="text-xs flex items-center gap-1"
              style={{ color: '#A78BFA' }}
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {topInsights.length > 0
              ? topInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 rounded-lg"
                    style={{
                      background: insight.priority === 'HIGH'
                        ? 'rgba(244, 63, 94, 0.06)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${insight.priority === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {insight.priority === 'HIGH' && (
                        <AlertCircle size={14} style={{ color: '#F43F5E', flexShrink: 0, marginTop: 2 }} />
                      )}
                      {insight.priority === 'MEDIUM' && (
                        <Trophy size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{insight.title}</div>
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {insight.body}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : Array(3).fill(null).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="skeleton h-4 w-48 rounded mb-2" />
                    <div className="skeleton h-3 w-full rounded" />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
