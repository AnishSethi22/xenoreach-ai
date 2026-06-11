'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Campaign, CommunicationEvent } from '@/types/campaign.types';
import { formatNumber, formatPercent, formatCurrency, timeAgo, CHANNEL_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaignBuilder } from '@/store/campaign-builder.store';
import { useState } from 'react';
import { StopCampaignModal } from '@/components/modals/StopCampaignModal';
import { CompleteCampaignModal } from '@/components/modals/CompleteCampaignModal';
import { LaunchSuccessModal } from '@/components/modals/LaunchSuccessModal';
import { toast } from 'react-hot-toast';

const FUNNEL_COLORS = ['#8B5CF6', '#10B981', '#0EA5E9', '#F59E0B', '#F43F5E'];

const EVENT_COLORS: Record<string, string> = {
  SENT: '#8B5CF6', DELIVERED: '#10B981', OPENED: '#0EA5E9',
  READ: '#60A5FA', CLICKED: '#F59E0B', CONVERTED: '#F43F5E', FAILED: '#6B7280',
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.get<Campaign>(`/campaigns/${id}`),
    refetchInterval: (query) => query.state.data?.status === 'RUNNING' ? 5000 : false,
  });

  const { data: events } = useQuery({
    queryKey: ['campaign-events', id],
    queryFn: () => api.get<CommunicationEvent[]>(`/campaigns/${id}/events`),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const analytics = campaign.analytics;
  const color = CHANNEL_COLORS[campaign.channel] || '#8B5CF6';

  const funnelData = analytics
    ? [
        { name: 'Sent', value: analytics.sentCount },
        { name: 'Delivered', value: analytics.deliveredCount },
        { name: 'Opened', value: analytics.openedCount },
        { name: 'Clicked', value: analytics.clickedCount },
        { name: 'Converted', value: analytics.convertedCount },
      ]
    : [];

  const eventTypeCounts: Record<string, number> = {};
  (events || []).forEach((e) => {
    eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1;
  });

  const eventBarData = Object.entries(eventTypeCounts).map(([type, count]) => ({ type, count }));

  const handleAction = async (action: 'pause' | 'resume' | 'stop' | 'complete' | 'duplicate' | 'launch') => {
    if (action === 'stop' && !stopModalOpen) {
      setStopModalOpen(true);
      return;
    }
    
    if (action === 'complete' && !completeModalOpen) {
      setCompleteModalOpen(true);
      return;
    }

    const previousCampaign = queryClient.getQueryData<Campaign>(['campaign', id]);

    try {
      if (action === 'duplicate') {
        const res = await api.post<{ id: string }>(`/campaigns/${id}/duplicate`, {});
        toast.success('Campaign Duplicated');
        router.push(`/campaigns/${res.id}`);
      } else {
        // Optimistic UI Update
        if (previousCampaign) {
          const optimisticStatus = action === 'pause' ? 'PAUSED' : action === 'resume' ? 'RUNNING' : action === 'stop' ? 'CANCELLED' : action === 'complete' ? 'COMPLETED' : previousCampaign.status;
          queryClient.setQueryData<Campaign>(['campaign', id], { ...previousCampaign, status: optimisticStatus });
        }

        await api.post(`/campaigns/${id}/${action}`, {});
        
        if (action === 'pause') toast.success('Campaign Paused');
        if (action === 'resume') toast.success('Campaign Resumed');
        if (action === 'stop') toast.success('Campaign Stopped');
        if (action === 'complete') toast.success('Campaign Completed Successfully');
        if (action === 'launch') {
          setLaunchModalOpen(true);
        }

        queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      }
    } catch (err) {
      console.error(`Failed to ${action} campaign:`, err);
      toast.error(`Failed to ${action} campaign`);
      if (previousCampaign) {
        queryClient.setQueryData(['campaign', id], previousCampaign);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Draft deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      router.push('/campaigns');
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast.error('Failed to delete draft');
    }
  };

  const continueEditing = () => {
    useCampaignBuilder.setState({
      step: 5, // Jump to Review step since it's a drafted campaign
      goal: campaign.goal || '',
      segmentRules: campaign.segmentRules || { operator: 'AND', conditions: [] },
      audiencePreview: { count: campaign.audienceSize || 0, sample: [] },
      messageTemplate: campaign.messageTemplate || '',
      channel: campaign.channel || 'EMAIL',
      name: campaign.name || '',
      description: campaign.description || '',
    });
    router.push('/campaigns/new');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/campaigns')}
          className="p-2 rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{campaign.name}</h1>
            <span className={`status-badge ${STATUS_COLORS[campaign.status]}`}>{campaign.status}</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {campaign.channel} · {formatNumber(campaign.audienceSize)} recipients · {timeAgo(campaign.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'RUNNING' && (
            <>
              <button onClick={() => handleAction('pause')} className="btn-secondary text-xs py-1.5 px-3">Pause</button>
              <button onClick={() => handleAction('complete')} className="btn-primary text-xs py-1.5 px-3">Complete Campaign</button>
              <button onClick={() => handleAction('stop')} className="btn-secondary text-xs py-1.5 px-3" style={{ color: '#F43F5E', borderColor: 'rgba(244,63,94,0.3)' }}>Stop Campaign</button>
            </>
          )}
          {campaign.status === 'PAUSED' && (
            <>
              <button onClick={() => handleAction('resume')} className="btn-primary text-xs py-1.5 px-3">Resume</button>
              <button onClick={() => handleAction('complete')} className="btn-primary text-xs py-1.5 px-3">Complete Campaign</button>
              <button onClick={() => handleAction('stop')} className="btn-secondary text-xs py-1.5 px-3" style={{ color: '#F43F5E', borderColor: 'rgba(244,63,94,0.3)' }}>Stop Campaign</button>
            </>
          )}
          {campaign.status === 'COMPLETED' && (
            <>
              <button onClick={() => window.print()} className="btn-secondary text-xs py-1.5 px-3">View Report</button>
              <button onClick={() => handleAction('duplicate')} className="btn-primary text-xs py-1.5 px-3">Duplicate Campaign</button>
            </>
          )}
          {campaign.status === 'DRAFT' && (
            <>
              <button onClick={() => handleDelete()} className="btn-secondary text-xs py-1.5 px-3" style={{ color: '#F43F5E', borderColor: 'rgba(244,63,94,0.3)' }}>Delete Draft</button>
              <button onClick={() => continueEditing()} className="btn-secondary text-xs py-1.5 px-3">Continue Editing</button>
              <button onClick={() => handleAction('launch')} className="btn-primary text-xs py-1.5 px-3">Launch Now</button>
            </>
          )}
          {campaign.status === 'CANCELLED' && (
            <button onClick={() => handleAction('duplicate')} className="btn-primary text-xs py-1.5 px-3">Duplicate Campaign</button>
          )}
        </div>
      </div>

      {campaign.aiReasoning && (
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: '#A78BFA' }}>AI Strategy</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{campaign.aiReasoning}</div>
        </div>
      )}

      {analytics && (
        <>
          {campaign.status === 'COMPLETED' && (
            <div className="glass-card p-6 mb-4 border-t-4 border-t-emerald-500">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">✓ Campaign Completed</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/40 mb-1">Started At</div>
                  <div className="text-sm font-medium text-white">{campaign.launchedAt ? formatDate(campaign.launchedAt) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/40 mb-1">Completed At</div>
                  <div className="text-sm font-medium text-white">{campaign.completedAt ? formatDate(campaign.completedAt) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/40 mb-1">Audience Size</div>
                  <div className="text-sm font-medium text-white">{formatNumber(campaign.audienceSize)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/40 mb-1">Revenue Generated</div>
                  <div className="text-sm font-bold text-emerald-400">{formatCurrency(analytics.revenueAttributed)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <div className="text-xl font-bold text-white">{formatNumber(analytics.sentCount)}</div>
                  <div className="text-xs text-white/50">Messages Sent</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#10B981' }}>{formatNumber(analytics.deliveredCount)}</div>
                  <div className="text-xs text-white/50">Delivered</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#0EA5E9' }}>{formatNumber(analytics.openedCount)}</div>
                  <div className="text-xs text-white/50">Opened</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#F59E0B' }}>{formatNumber(analytics.clickedCount)}</div>
                  <div className="text-xs text-white/50">Clicked</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#F43F5E' }}>{formatNumber(analytics.convertedCount)}</div>
                  <div className="text-xs text-white/50">Converted</div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Delivery Rate', value: formatPercent(analytics.deliveryRate), color: '#8B5CF6' },
              { label: 'Open Rate', value: formatPercent(analytics.openRate), color: '#0EA5E9' },
              { label: 'Click Rate', value: formatPercent(analytics.clickRate), color: '#F59E0B' },
              { label: 'Conversion Rate', value: formatPercent(analytics.conversionRate), color: '#10B981' },
            ].map(({ label, value, color: c }) => (
              <div key={label} className="metric-card">
                <div className="text-2xl font-bold text-white mb-1" style={{ color: c }}>{value}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Delivery Funnel</h2>
              <div className="space-y-3">
                {funnelData.map((item, i) => {
                  const pct = funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.name}</span>
                        <span className="text-xs font-semibold text-white">
                          {formatNumber(item.value)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: FUNNEL_COLORS[i] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Revenue Attributed</span>
                <span className="text-lg font-bold" style={{ color: '#10B981' }}>
                  {formatCurrency(analytics.revenueAttributed)}
                </span>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">
                Live Events
                {campaign.status === 'RUNNING' && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </h2>
              {eventBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={eventBarData}>
                    <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {eventBarData.map((entry, i) => (
                        <Cell key={i} fill={EVENT_COLORS[entry.type] || '#8B5CF6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <div className="text-center">
                    <div className="text-sm">No events yet</div>
                    <div className="text-xs mt-1">Events will appear as delivery progresses</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {events && events.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Recent Events</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.slice(0, 30).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: EVENT_COLORS[event.eventType] || '#8B5CF6' }}
                    />
                    <span className="text-xs font-medium" style={{ color: EVENT_COLORS[event.eventType] || '#8B5CF6', width: 80, flexShrink: 0 }}>
                      {event.eventType}
                    </span>
                    <span className="text-sm text-white flex-1 truncate">
                      {event.customer?.name || 'Customer'}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {timeAgo(event.occurredAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <StopCampaignModal
        isOpen={stopModalOpen}
        onClose={() => setStopModalOpen(false)}
        onConfirm={() => handleAction('stop')}
      />
      
      <CompleteCampaignModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={() => handleAction('complete')}
      />
      
      {campaign && (
        <LaunchSuccessModal
          isOpen={launchModalOpen}
          campaignId={campaign.id}
          campaignName={campaign.name}
          audienceSize={campaign.audienceSize}
          channel={campaign.channel}
          estimatedReach={'High Engagement'}
          onCreateAnother={() => setLaunchModalOpen(false)}
        />
      )}
    </div>
  );
}
