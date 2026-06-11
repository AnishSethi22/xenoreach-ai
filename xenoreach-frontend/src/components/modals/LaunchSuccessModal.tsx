import { Rocket, BarChart2, Plus, Users, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatNumber, CHANNEL_COLORS } from '@/lib/utils';
import { CampaignChannel } from '@/types/campaign.types';
import { BaseModal } from './BaseModal';

interface LaunchSuccessModalProps {
  isOpen: boolean;
  campaignId: string;
  campaignName: string;
  audienceSize: number;
  channel: CampaignChannel;
  estimatedReach: string;
  onCreateAnother: () => void;
}

export function LaunchSuccessModal({ isOpen, campaignId, campaignName, audienceSize, channel, estimatedReach, onCreateAnother }: LaunchSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onCreateAnother} maxWidth="max-w-lg">
      <div className="text-center mt-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))', border: '1px solid rgba(16, 185, 129, 0.3)' }}
        >
          <Rocket size={36} style={{ color: '#10B981' }} className="animate-bounce" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Campaign Successfully Launched 🚀</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Your message is now being dispatched to the selected audience.
        </p>

        <div className="text-left space-y-3 mb-8">
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Campaign Name</span>
            <span className="text-sm font-semibold text-white">{campaignName}</span>
          </div>
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Audience Size</span>
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Users size={14} style={{ color: '#A78BFA' }} /> {formatNumber(audienceSize)}
            </span>
          </div>
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Channel</span>
            <span className="text-sm font-semibold" style={{ color: CHANNEL_COLORS[channel] }}>{channel}</span>
          </div>
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Estimated Reach</span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <Zap size={14} /> {estimatedReach}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => router.push(`/campaigns/${campaignId}`)} className="btn-primary flex-1 justify-center py-3">
            <BarChart2 size={16} /> View Live Analytics
          </button>
          <button onClick={onCreateAnother} className="btn-secondary flex-1 justify-center py-3">
            <Plus size={16} /> Create Another Campaign
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
