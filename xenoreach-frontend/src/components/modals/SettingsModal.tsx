'use client';

import { LayoutGrid, Cpu, Megaphone, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BaseModal } from './BaseModal';

function Row({ label, value, color = '#10B981', icon }: { label: string; value: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 500, color, display: 'flex', alignItems: 'center', gap: '5px' }}>
        {icon}{value}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {icon}
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">

      {/* Title */}
      <div style={{ marginBottom: '24px', marginTop: '4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>Settings</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
          System preferences and environment information.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Application */}
        <Section title="Application" icon={<LayoutGrid size={15} color="#A78BFA" />}>
          <Row label="Demo Mode" value="Active" icon={<CheckCircle2 size={13} />} />
          <Row label="CRM Intelligence Fallback" value="Enabled" icon={<CheckCircle2 size={13} />} />
          <div style={{ gridColumn: '1 / -1', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Environment Status</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Production Ready
            </div>
          </div>
        </Section>

        {/* AI Configuration */}
        <Section title="AI Configuration" icon={<Cpu size={15} color="#A78BFA" />}>
          <Row label="Gemini Status" value="Quota Limit Reached" color="#F59E0B" icon={<ShieldAlert size={13} />} />
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#10B981', marginBottom: '4px' }}>CRM Intelligence Status</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} /> Active (Fallback)
            </div>
          </div>
        </Section>

        {/* Campaign Settings */}
        <Section title="Campaign Settings" icon={<Megaphone size={15} color="#A78BFA" />}>
          <Row label="Auto Refresh" value="Enabled (5s interval)" icon={<CheckCircle2 size={13} />} />
          <Row label="Draft Persistence" value="Enabled" icon={<CheckCircle2 size={13} />} />
        </Section>

        {/* System Information */}
        <Section title="System Information" icon={<Terminal size={15} color="#A78BFA" />}>
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Frontend Version</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'white', fontFamily: 'monospace' }}>v1.2.0-rc</div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Backend Version</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'white', fontFamily: 'monospace' }}>v1.2.0-rc</div>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
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
