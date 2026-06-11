'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Customer, Order } from '@/types/customer.types';
import { PaginatedResponse } from '@/types/common.types';
import { formatCurrency, formatPercent, timeAgo } from '@/lib/utils';
import { ArrowLeft, ShoppingBag, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LOYALTY_TIER_STYLES: Record<string, string> = {
  BRONZE: 'loyalty-bronze', SILVER: 'loyalty-silver', GOLD: 'loyalty-gold', PLATINUM: 'loyalty-platinum',
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => api.get<PaginatedResponse<Order>>(`/customers/${id}/orders?limit=10`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const m = customer.metrics;
  const churn = parseFloat(m?.churnProbability || '0');
  const churnColor = churn >= 0.7 ? '#F43F5E' : churn >= 0.4 ? '#F59E0B' : '#10B981';

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/customers')}
          className="p-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)' }}
          >
            {customer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{customer.name}</h1>
              {m && <span className={`tag ${LOYALTY_TIER_STYLES[m.loyaltyTier]}`}>{m.loyaltyTier}</span>}
            </div>
            <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {customer.email} · {customer.city}, {customer.state}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: formatCurrency(m?.totalSpend), color: '#10B981' },
          { label: 'Total Orders', value: String(m?.orderCount || 0), color: '#8B5CF6' },
          { label: 'Avg Order Value', value: formatCurrency(m?.avgOrderValue), color: '#0EA5E9' },
          { label: 'Loyalty Points', value: (m?.loyaltyPoints || 0).toLocaleString(), color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card">
            <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Customer Profile</h2>
          <div className="space-y-3">
            {[
              { label: 'Gender', value: customer.gender },
              { label: 'City', value: customer.city },
              { label: 'State', value: customer.state },
              { label: 'Phone', value: customer.phone },
              { label: 'RFM Segment', value: m?.rfmSegment },
              { label: 'First Order', value: m?.firstOrderDate ? timeAgo(m.firstOrderDate) : null },
              { label: 'Last Order', value: m?.lastOrderDate ? timeAgo(m.lastOrderDate) : null },
              { label: 'Days Since Last', value: m?.daysSinceLast != null ? `${m.daysSinceLast} days` : null },
            ].map(({ label, value }) => (
              value && (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span className="text-sm text-white capitalize">{value}</span>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">AI Scores</h2>
          <div className="space-y-4">
            {[
              { label: 'Engagement Score', value: Number(m?.engagementScore || 0), max: 100, color: '#0EA5E9', display: `${Number(m?.engagementScore || 0).toFixed(0)}/100` },
              { label: 'Churn Risk', value: parseFloat(m?.churnProbability || '0') * 100, max: 100, color: churnColor, display: formatPercent(m?.churnProbability, 0) },
              { label: 'Purchase Propensity', value: parseFloat(m?.purchasePropensity || '0') * 100, max: 100, color: '#10B981', display: formatPercent(m?.purchasePropensity, 0) },
            ].map(({ label, value, color, display }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{display}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, value)}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>RFM Scores</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Recency', value: m?.recencyScore },
                { label: 'Frequency', value: m?.frequencyScore },
                { label: 'Monetary', value: m?.monetaryScore },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="text-lg font-bold text-white">{value || '—'}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingBag size={14} style={{ color: '#A78BFA' }} />
              Recent Orders
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {ordersData?.data.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{order.orderNumber}</span>
                    <span className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{order.channel} · {order.itemCount} items</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeAgo(order.createdAt)}</span>
                  </div>
                </div>
              ))}
              {!ordersData?.data.length && (
                <div className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No recent orders</div>
              )}
            </div>
          </div>

          <div className="glass-card p-5 border-t-2 border-t-violet-500">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={14} style={{ color: '#A78BFA' }} />
              Next Best Action
            </h2>
            <div className="space-y-3">
              {churn >= 0.6 ? (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="text-xs font-bold text-rose-400 mb-1">High Churn Risk</div>
                  <div className="text-sm text-white/80 mb-2">Customer hasn&apos;t purchased recently. Recommended action: Win-back campaign with 15% discount.</div>
                  <button onClick={() => router.push('/campaigns/new')} className="btn-secondary text-xs py-1.5 px-3 w-full justify-center">Create Win-back Campaign</button>
                </div>
              ) : parseFloat(m?.purchasePropensity || '0') >= 0.7 ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400 mb-1">High Purchase Propensity</div>
                  <div className="text-sm text-white/80 mb-2">Customer is highly likely to buy. Recommended action: Upsell premium products.</div>
                  <button onClick={() => router.push('/campaigns/new')} className="btn-primary text-xs py-1.5 px-3 w-full justify-center bg-emerald-600 hover:bg-emerald-500">Create Upsell Campaign</button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <div className="text-xs font-bold text-violet-400 mb-1">Maintain Engagement</div>
                  <div className="text-sm text-white/80 mb-2">Customer is stable. Recommended action: Send monthly newsletter or general update.</div>
                  <button onClick={() => router.push('/campaigns/new')} className="btn-secondary text-xs py-1.5 px-3 w-full justify-center">Create Engagement Campaign</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
