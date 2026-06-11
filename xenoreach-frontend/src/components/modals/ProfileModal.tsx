'use client';

import { User, Shield, Info, LogOut, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { BaseModal } from './BaseModal';

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {/* Header — Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', marginTop: '4px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
          }}
        >
          DR
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Demo Reviewer</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>reviewer@xenoreach.ai</div>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Role */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={15} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Role</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Reviewer</span>
        </div>

        {/* Email */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={15} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Account Information</span>
          </div>
          <button style={{
            fontSize: '12px', fontWeight: 600, color: '#8B5CF6',
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '8px', padding: '4px 12px', cursor: 'pointer',
          }}>
            View Profile
          </button>
        </div>

        {/* Environment badge */}
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Shield size={14} color="#FCD34D" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Environment</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Demo Mode</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Pre-seeded evaluation environment</div>
        </div>

      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: 'transparent', color: '#F43F5E',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} /> Logout
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '8px 24px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
            border: '1px solid rgba(139,92,246,0.5)',
            color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
}
