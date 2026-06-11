'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Filter,
  BarChart3,
  Lightbulb,
  Zap,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/segments', icon: Filter, label: 'Segments' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/insights', icon: Lightbulb, label: 'AI Insights' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[220px] flex flex-col z-40"
      style={{
        background: '#0a0a0b',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="p-5 border-b border-white/5">
        <Link href="/overview" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
            }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">XenoReach</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>AI Platform</div>
          </div>
        </Link>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="mb-5">
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            <Plus size={14} />
            New Campaign
          </Link>
        </div>

        <div className="space-y-0.5">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Navigation
          </p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/overview' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn('sidebar-item', isActive && 'active')}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div
        className="p-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
          style={{ background: 'rgba(139, 92, 246, 0.08)' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#10B981' }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            AI Engine Online
          </span>
        </div>
      </div>
    </aside>
  );
}
