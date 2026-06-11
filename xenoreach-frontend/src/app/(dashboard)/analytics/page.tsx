'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { OverviewMetrics, ChannelPerformance, TrendDataPoint, RevenueBreakdown, AudienceHealth } from '@/types/analytics.types';
import { formatCurrency, formatPercent, formatNumber, CHANNEL_COLORS } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const FUNNEL_COLORS = ['#8B5CF6', '#10B981', '#0EA5E9', '#F59E0B'];

export default function AnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get<OverviewMetrics>('/analytics/overview'),
  });

  const { data: channels } = useQuery({
    queryKey: ['analytics', 'channels'],
    queryFn: () => api.get<ChannelPerformance[]>('/analytics/channels'),
  });

  const { data: trends } = useQuery({
    queryKey: ['analytics', 'trends', 30],
    queryFn: () => api.get<TrendDataPoint[]>('/analytics/trends?days=30'),
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => api.get<RevenueBreakdown[]>('/analytics/revenue'),
  });

  const { data: audience } = useQuery({
    queryKey: ['analytics', 'audience'],
    queryFn: () => api.get<AudienceHealth>('/analytics/audience'),
  });

  const loyaltyData = (audience as AudienceHealth | undefined)?.loyaltyTiers.map((t) => ({
    name: t.loyaltyTier,
    value: t._count,
  })) || [];

  const LOYALTY_COLORS: Record<string, string> = {
    BRONZE: '#CD7F32', SILVER: '#A8A9AD', GOLD: '#FFD700', PLATINUM: '#E5E4E2',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Platform-wide performance insights and trends
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Delivery Rate', value: formatPercent(overview?.overallDeliveryRate), color: '#8B5CF6' },
          { label: 'Open Rate', value: formatPercent(overview?.overallOpenRate), color: '#0EA5E9' },
          { label: 'Click Rate', value: formatPercent(overview?.overallClickRate), color: '#F59E0B' },
          { label: 'Conversion Rate', value: formatPercent(overview?.overallConversionRate), color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card">
            <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">30-Day Message Trends</h2>
        {trends ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends as TrendDataPoint[]}>
              <defs>
                {[
                  { id: 'sent', color: '#8B5CF6' },
                  { id: 'delivered', color: '#10B981' },
                  { id: 'opened', color: '#0EA5E9' },
                  { id: 'clicked', color: '#F59E0B' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="SENT" stroke="#8B5CF6" fill="url(#grad-sent)" strokeWidth={2} name="Sent" />
              <Area type="monotone" dataKey="DELIVERED" stroke="#10B981" fill="url(#grad-delivered)" strokeWidth={2} name="Delivered" />
              <Area type="monotone" dataKey="OPENED" stroke="#0EA5E9" fill="url(#grad-opened)" strokeWidth={2} name="Opened" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="skeleton h-52 rounded-lg" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Channel Comparison</h2>
          {channels ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channels as ChannelPerformance[]} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="channel" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: unknown) => `${(Number(v) * 100).toFixed(1)}%`} contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="openRate" radius={[0, 4, 4, 0]} name="Open Rate">
                  {(channels as ChannelPerformance[]).map((entry) => (
                    <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-48 rounded-lg" />
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Loyalty Tier Distribution</h2>
          {loyaltyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={loyaltyData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                  {loyaltyData.map((entry) => (
                    <Cell key={entry.name} fill={LOYALTY_COLORS[entry.name] || '#8B5CF6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-48 rounded-lg" />
          )}
        </div>
      </div>

      {revenue && (revenue as RevenueBreakdown[]).length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Revenue by Campaign</h2>
          <div className="space-y-3">
            {(revenue as RevenueBreakdown[]).slice(0, 8).map((r) => {
              const maxRev = Math.max(...(revenue as RevenueBreakdown[]).map((x) => x.revenue));
              const pct = maxRev > 0 ? (r.revenue / maxRev) * 100 : 0;
              return (
                <div key={r.id} className="flex items-center gap-4">
                  <div className="text-sm text-white truncate flex-1 max-w-xs">{r.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: CHANNEL_COLORS[r.channel] || '#8B5CF6' }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white w-24 text-right">
                    {formatCurrency(r.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
