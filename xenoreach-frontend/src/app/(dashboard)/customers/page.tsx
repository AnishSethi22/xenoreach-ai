'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Customer } from '@/types/customer.types';
import { PaginatedResponse } from '@/types/common.types';
import { formatCurrency, formatPercent, timeAgo } from '@/lib/utils';
import { Search, Users, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const LOYALTY_TIER_STYLES: Record<string, string> = {
  BRONZE: 'loyalty-bronze',
  SILVER: 'loyalty-silver',
  GOLD: 'loyalty-gold',
  PLATINUM: 'loyalty-platinum',
};

const TIER_FILTERS = ['ALL', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loyaltyTier, setLoyaltyTier] = useState('ALL');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  let searchTimeout: NodeJS.Timeout;
  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', page, debouncedSearch, loyaltyTier],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(loyaltyTier !== 'ALL' && { loyaltyTier }),
        sortBy: 'totalSpend',
        sortOrder: 'desc',
      });
      return api.get<PaginatedResponse<Customer>>(`/customers?${params}`);
    },
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Customers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {pagination?.total ? `${pagination.total.toLocaleString()} customers` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search name, email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {TIER_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => { setLoyaltyTier(t); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: loyaltyTier === t ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${loyaltyTier === t ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: loyaltyTier === t ? '#A78BFA' : 'rgba(255,255,255,0.5)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Customer', 'City', 'Tier', 'Total Spend', 'Orders', 'Last Active', 'Churn Risk'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(10).fill(null).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array(7).fill(null).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '160px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : customers.map((customer) => {
                  const churn = parseFloat(customer.metrics?.churnProbability || '0');
                  const churnColor = churn >= 0.7 ? '#F43F5E' : churn >= 0.4 ? '#F59E0B' : '#10B981';
                  return (
                    <tr
                      key={customer.id}
                      className="table-row cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
                          >
                            {customer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{customer.name}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {customer.city || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {customer.metrics && (
                          <span className={`tag ${LOYALTY_TIER_STYLES[customer.metrics.loyaltyTier]}`}>
                            {customer.metrics.loyaltyTier}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {formatCurrency(customer.metrics?.totalSpend)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {customer.metrics?.orderCount || 0}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {customer.metrics?.lastOrderDate ? timeAgo(customer.metrics.lastOrderDate) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${churn * 100}%`, background: churnColor }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: churnColor }}>
                            {formatPercent(churn, 0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
