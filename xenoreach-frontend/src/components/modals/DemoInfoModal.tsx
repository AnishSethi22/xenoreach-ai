import { Info, Database, Zap, Sparkles } from 'lucide-react';
import { BaseModal } from './BaseModal';

export function DemoInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
          <Info size={20} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Reviewer Mode</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>System Information</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Database size={16} className="mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <div>
            <div className="text-sm font-medium text-white mb-1">Pre-seeded Database</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              The Neon PostgreSQL database has been pre-seeded with 1000+ customer profiles, order history, and simulated campaign events to provide a complete evaluation experience.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Zap size={16} className="mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <div>
            <div className="text-sm font-medium text-white mb-1">Live Event Simulation</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Campaign launches trigger real-time simulated delivery funnels. You can watch campaigns execute dynamically on the monitoring dashboard.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <div>
            <div className="text-sm font-medium text-white mb-1">AI Resilience</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              The AI Copilot uses Gemini by default, but features a robust deterministic fallback engine to guarantee 100% uptime if API limits are reached.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onClose} className="btn-primary px-6">Close</button>
      </div>
    </BaseModal>
  );
}
