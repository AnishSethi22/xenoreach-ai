'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Campaign } from '@/types/campaign.types';
import { PaginatedResponse } from '@/types/common.types';
import { formatNumber, formatPercent, formatCurrency, timeAgo, STATUS_COLORS, CHANNEL_COLORS } from '@/lib/utils';
import { Plus, Search, Megaphone, MessageSquare, Mail, Phone, Radio, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  WHATSAPP: MessageSquare, EMAIL: Mail, SMS: Phone, RCS: Radio,
};

const STATUS_FILTERS = ['ALL', 'DRAFT', 'RUNNING', 'COMPLETED', 'PAUSED', 'CANCELLED'];

export default function CampaignsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaigns', statusFilter],
    queryFn: () => api.get<PaginatedResponse<Campaign>>(`/campaigns?limit=50${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`),
  });

  const campaigns = data?.data || [];
  const filtered = search
    ? campaigns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : campaigns;

  const hasRunning = campaigns.some(c => c.status === 'RUNNING');

  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [hasRunning, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    await refetch();
    setLastRefreshed(new Date());
    setIsRefreshing(false);
    toast.success('Campaign list updated');
  };

  const getStatusCount = (status: string) => campaigns.filter(c => c.status === status).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Campaigns</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {data?.pagination.total || 0} total campaigns
            </p>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Updated {timeAgo(lastRefreshed.toISOString())}
            </p>
          </div>
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
          <button onClick={() => router.push('/campaigns/new')} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => {
            const count = s === 'ALL' ? campaigns.length : getStatusCount(s);
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: statusFilter === s ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${statusFilter === s ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: statusFilter === s ? '#A78BFA' : 'rgba(255,255,255,0.5)',
                }}
              >
                {s} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Megaphone size={22} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <div className="text-white font-medium">No campaigns found</div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Create your first AI campaign to get started
          </div>
          <button onClick={() => router.push('/campaigns/new')} className="btn-primary mt-4 mx-auto">
            <Plus size={14} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign) => {
            const Icon = CHANNEL_ICONS[campaign.channel] || MessageSquare;
            const color = CHANNEL_COLORS[campaign.channel] || '#8B5CF6';
            return (
              <button
                key={campaign.id}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                className="glass-card p-5 w-full flex items-center gap-4 text-left"
                style={{ borderRadius: '12px' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{campaign.name}</span>
                    <span className={`status-badge ${STATUS_COLORS[campaign.status]}`}>{campaign.status}</span>
                  </div>
                  <div className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {campaign.goal}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {formatNumber(campaign.audienceSize)} recipients
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {timeAgo(campaign.createdAt)}
                    </span>
                  </div>
                </div>
                {campaign.analytics && (
                  <div className="flex gap-4 text-right flex-shrink-0">
                    <div>
                      <div className="text-sm font-semibold text-white">{formatPercent(campaign.analytics.deliveryRate)}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Delivered</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{formatPercent(campaign.analytics.openRate)}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Opened</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#10B981' }}>
                        {formatCurrency(campaign.analytics.revenueAttributed)}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Revenue</div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
