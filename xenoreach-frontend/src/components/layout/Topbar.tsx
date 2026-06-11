'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useCopilotStore } from '@/store/copilot.store';
import { getInitials } from '@/lib/utils';
import { MessageSquare, LogOut, ChevronRight, User, Settings, Info, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { DemoInfoModal } from '@/components/modals/DemoInfoModal';

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Overview',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'New Campaign',
  '/customers': 'Customers',
  '/segments': 'Segments',
  '/analytics': 'Analytics',
  '/insights': 'AI Insights',
};

export function Topbar() {
  const pathname = usePathname();
  const { user, logout, isDemoMode } = useAuthStore();
  const { toggle } = useCopilotStore();
  const router = useRouter();

  const title = PAGE_TITLES[pathname] || 'XenoReach AI';
  const breadcrumbs = pathname.split('/').filter(Boolean);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    router.push('/login');
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(7, 7, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />}
            <span
              style={{
                color: i === breadcrumbs.length - 1
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.4)',
                fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                textTransform: 'capitalize',
              }}
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <div
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#A78BFA',
            }}
          >
            Demo Mode
          </div>
        )}

        <button
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            color: '#A78BFA',
          }}
          aria-label="Open AI Copilot"
        >
          <MessageSquare size={14} />
          <span>AI Copilot</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg transition-all hover:bg-white/5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
            >
              {isDemoMode ? 'DR' : (user ? getInitials(user.name) : 'U')}
            </div>
            <div className="text-left hidden sm:block mr-1">
              <div className="text-sm font-medium text-white leading-tight">
                {isDemoMode ? 'Demo Reviewer' : user?.name || 'User'}
              </div>
              <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isDemoMode ? 'reviewer@xenoreach.ai' : user?.email || ''}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl py-1 animate-scale-in"
              style={{
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 9998,
                transformOrigin: 'top right',
              }}
            >
              <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                <div className="text-sm font-semibold text-white">
                  {isDemoMode ? 'Demo Reviewer' : user?.name || 'User'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {isDemoMode ? 'reviewer@xenoreach.ai' : user?.email || ''}
                </div>
              </div>

              <button
                onClick={() => { setProfileOpen(true); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <User size={14} style={{ color: 'rgba(255,255,255,0.5)' }} /> View Profile
              </button>

              <button
                onClick={() => { setSettingsOpen(true); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <Settings size={14} style={{ color: 'rgba(255,255,255,0.5)' }} /> Settings
              </button>

              {isDemoMode && (
                <button
                  onClick={() => { setDemoInfoOpen(true); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  <Info size={14} style={{ color: 'rgba(255,255,255,0.5)' }} /> Demo Info
                </button>
              )}

              <div className="h-px bg-white/10 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-rose-500/10"
                style={{ color: '#F43F5E' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DemoInfoModal isOpen={demoInfoOpen} onClose={() => setDemoInfoOpen(false)} />
    </header>
  );
}
