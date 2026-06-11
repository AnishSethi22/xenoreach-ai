import { AlertTriangle } from 'lucide-react';
import { BaseModal } from './BaseModal';

export function StopCampaignModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
          <AlertTriangle size={20} style={{ color: '#F43F5E' }} />
        </div>
        <h2 className="text-xl font-bold text-white">Stop Campaign?</h2>
      </div>

      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
        This campaign is currently running. Messages already sent cannot be recalled. Are you sure you want to stop?
      </p>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: '#F43F5E', boxShadow: '0 0 15px rgba(244, 63, 94, 0.3)' }}
        >
          Stop Campaign
        </button>
      </div>
    </BaseModal>
  );
}
