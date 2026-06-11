'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignBuilder } from '@/store/campaign-builder.store';
import { api } from '@/lib/api-client';
import { SegmentRule, CampaignChannel, AudiencePreview } from '@/types/campaign.types';
import { formatCurrency, formatPercent, formatNumber, CHANNEL_COLORS } from '@/lib/utils';
import {
  Sparkles, ArrowRight, ArrowLeft, Zap, Target, MessageSquare,
  Radio, Mail, Phone, Users, ChevronDown, ChevronUp, CheckCircle, Rocket
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Goal', desc: 'What do you want to achieve?' },
  { id: 2, label: 'Audience', desc: 'Who should you reach?' },
  { id: 3, label: 'Message', desc: 'What should you say?' },
  { id: 4, label: 'Channel', desc: 'How should you reach them?' },
  { id: 5, label: 'Review', desc: 'Ready to launch?' },
];

const GOAL_SUGGESTIONS = [
  'Increase repeat purchases from inactive customers',
  'Recover churn-risk customers in the GOLD tier',
  'Boost loyalty member engagement',
  'Upsell premium products to Champions',
  'Welcome new customers with a first-purchase offer',
  'Reactivate customers who clicked but never purchased',
];

const CHANNEL_OPTIONS: Array<{ channel: CampaignChannel; icon: React.ElementType; desc: string; openRate: string }> = [
  { channel: 'WHATSAPP', icon: MessageSquare, desc: 'Highest engagement. Best for conversational campaigns.', openRate: '72%' },
  { channel: 'EMAIL', icon: Mail, desc: 'Rich content. Best for detailed offers and newsletters.', openRate: '32%' },
  { channel: 'SMS', icon: Phone, desc: 'Universal reach. Best for time-sensitive offers.', openRate: '55%' },
  { channel: 'RCS', icon: Radio, desc: 'Rich interactive format with buttons and images.', openRate: '48%' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`step-dot ${currentStep > step.id ? 'completed' : currentStep === step.id ? 'active' : 'inactive'}`}>
            {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line w-12 ${currentStep > step.id ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1Goal() {
  const { goal, setGoal, setStep, setSegmentRules, setAiReasoning, setEstimatedImpact, setChannel, setIsGeneratingAudience } = useCampaignBuilder();
  const [showSuggestions, setShowSuggestions] = useState(true);

  async function handleNext() {
    if (!goal.trim()) return;
    setIsGeneratingAudience(true);
    setStep(2);

    try {
      const result = await api.post<{
        rules: SegmentRule;
        reasoning: string;
        estimatedImpact: string;
        recommendedChannel: CampaignChannel;
      }>('/ai/translate-goal', { goal });

      setSegmentRules(result.rules);
      setAiReasoning(result.reasoning);
      setEstimatedImpact(result.estimatedImpact);
      setChannel(result.recommendedChannel);
    } catch {
      setSegmentRules({
        operator: 'AND',
        conditions: [
          { field: 'days_since_last', operator: 'gte', value: 30 },
          { field: 'total_spend', operator: 'gte', value: 1000 },
        ],
      });
      setAiReasoning('Targeting customers with recent purchase history who show engagement signals.');
      setEstimatedImpact('Estimated 8-15% conversion rate with personalized messaging.');
    } finally {
      setIsGeneratingAudience(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)' }}
        >
          <Target size={24} style={{ color: '#A78BFA' }} />
        </div>
        <h2 className="text-xl font-semibold text-white">What is your campaign goal?</h2>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Describe your marketing objective in plain language. AI will do the rest.
        </p>
      </div>

      <textarea
        className="input-field resize-none"
        rows={4}
        placeholder="e.g. Increase repeat purchases from customers who haven't ordered in 30 days..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        autoFocus
      />

      <div>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-1.5 text-xs mb-3"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <Sparkles size={12} style={{ color: '#A78BFA' }} />
          AI Suggestions
          {showSuggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showSuggestions && (
          <div className="grid grid-cols-1 gap-2">
            {GOAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setGoal(s)}
                className="text-left px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: goal === s ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${goal === s ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: goal === s ? '#A78BFA' : 'rgba(255,255,255,0.6)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!goal.trim()}
        className="btn-primary w-full justify-center"
      >
        <Sparkles size={15} />
        Analyze with AI
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function Step2Audience() {
  const { segmentRules, aiReasoning, estimatedImpact, isGeneratingAudience, setStep, setAudiencePreview, audiencePreview } = useCampaignBuilder();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewDone, setPreviewDone] = useState(!!audiencePreview);

  async function fetchPreview() {
    if (!segmentRules) return;
    setIsPreviewing(true);
    try {
      const result = await api.post<AudiencePreview>('/segments/preview', { rules: segmentRules });
      setAudiencePreview(result);
      setPreviewDone(true);
    } catch {
      setPreviewDone(true);
    } finally {
      setIsPreviewing(false);
    }
  }

  if (isGeneratingAudience) {
    return (
      <div className="text-center py-16 space-y-4 animate-fade-in">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
        >
          <Sparkles size={24} style={{ color: '#A78BFA' }} className="animate-pulse" />
        </div>
        <div>
          <div className="text-white font-medium">AI is analyzing your goal...</div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Identifying the best audience segment
          </div>
        </div>
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#8B5CF6', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">AI-Identified Audience</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Review the segment AI selected for your goal
        </p>
      </div>

      {aiReasoning && (
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
        >
          <div className="flex items-start gap-3">
            <Sparkles size={16} style={{ color: '#A78BFA', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: '#A78BFA' }}>AI Reasoning</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{aiReasoning}</div>
            </div>
          </div>
        </div>
      )}

      {estimatedImpact && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}
        >
          <span style={{ color: '#10B981', fontWeight: 500 }}>Estimated Impact: </span>
          {estimatedImpact}
        </div>
      )}

      {segmentRules && (
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Segment Rules
          </div>
          <div className="space-y-2">
            {segmentRules.conditions.map((cond, i) => {
              if ('field' in cond) {
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {i > 0 && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}
                      >
                        {segmentRules.operator}
                      </span>
                    )}
                    <span
                      className="px-2 py-1 rounded font-mono text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      {cond.field}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{cond.operator}</span>
                    <span
                      className="px-2 py-1 rounded font-mono text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A78BFA' }}
                    >
                      {String(cond.value)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {!previewDone ? (
        <button
          onClick={fetchPreview}
          disabled={isPreviewing}
          className="btn-secondary w-full justify-center"
        >
          {isPreviewing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Users size={15} />
          )}
          {isPreviewing ? 'Calculating...' : 'Preview Audience Size'}
        </button>
      ) : audiencePreview && (
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
        >
          <div className="text-2xl font-bold text-white mb-1">{formatNumber(audiencePreview.count)}</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>customers match this audience</div>
          {audiencePreview.sample.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Sample</div>
              {audiencePreview.sample.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span>{c.name}</span>
                  <span>{c.city} · {formatCurrency(c.metrics?.totalSpend)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!segmentRules}
          className="btn-primary flex-1 justify-center"
        >
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Step3Message() {
  const { goal, channel, messageTemplate, subjectLine, setMessageTemplate, setSubjectLine, setStep, isGeneratingMessage, setIsGeneratingMessage, audiencePreview } = useCampaignBuilder();
  const [error, setError] = useState('');

  async function generateMessage() {
    setIsGeneratingMessage(true);
    setError('');
    try {
      const result = await api.post<{ messageTemplate: string; subjectLine?: string }>('/ai/generate-message', {
        goal,
        channel,
        audienceDescription: `${audiencePreview?.count || 'selected'} customers`,
      });
      setMessageTemplate(result.messageTemplate);
      if (result.subjectLine) setSubjectLine(result.subjectLine);
    } catch {
      setError('Message generation failed. Please write your message manually.');
    } finally {
      setIsGeneratingMessage(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Campaign Message</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          AI-generated copy for {channel}. Edit freely.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#FB7185' }}>
          {error}
        </div>
      )}

      <button
        onClick={generateMessage}
        disabled={isGeneratingMessage}
        className="btn-secondary w-full justify-center"
      >
        {isGeneratingMessage ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Sparkles size={15} style={{ color: '#A78BFA' }} />
        )}
        {isGeneratingMessage ? 'Generating...' : 'Generate with AI'}
      </button>

      {channel === 'EMAIL' && (
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Subject Line
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter email subject line..."
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Message Template
          <span className="ml-2 text-violet-400">Use {'{{name}}'} for personalization</span>
        </label>
        <textarea
          className="input-field resize-none"
          rows={8}
          placeholder={`Write your ${channel} message here...`}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!messageTemplate.trim()}
          className="btn-primary flex-1 justify-center"
        >
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Step4Channel() {
  const { channel, setChannel, setStep } = useCampaignBuilder();

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Select Channel</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          AI recommended the best channel for this goal. You can override.
        </p>
      </div>

      <div className="space-y-3">
        {CHANNEL_OPTIONS.map(({ channel: ch, icon: Icon, desc, openRate }) => {
          const color = CHANNEL_COLORS[ch];
          const isSelected = channel === ch;
          return (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
              style={{
                background: isSelected ? `${color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? color + '50' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{ch}</span>
                  {isSelected && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>
                      AI Recommended
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color }}>{openRate}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>avg open</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center">
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={() => setStep(5)} className="btn-primary flex-1 justify-center">
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Step5Review({ onLaunchSuccess }: { onLaunchSuccess: (id: string) => void }) {
  const { goal, channel, messageTemplate, segmentRules, audiencePreview, name, description, setName, setDescription, setStep } = useCampaignBuilder();
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState('');

  async function handleLaunch() {
    setError('');
    if (!name.trim()) {
      setError('Campaign name is required to launch.');
      return;
    }
    if (!messageTemplate?.trim()) {
      setError('Message template is empty. Please go back to Step 3 and generate a message.');
      return;
    }
    if (!audiencePreview || audiencePreview.count === 0) {
      setError('Audience size is 0. Please go back to Step 2 and generate a valid audience.');
      return;
    }

    setIsLaunching(true);
    try {
      const campaign = await api.post<{ id: string }>('/campaigns', {
        name,
        description,
        goal,
        channel,
        segmentRules,
        messageTemplate,
        audienceSize: audiencePreview.count,
      });

      await api.post(`/campaigns/${campaign.id}/launch`, {});
      onLaunchSuccess(campaign.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Review & Launch</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Final check before sending to {formatNumber(audiencePreview?.count || 0)} customers
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Campaign Name *
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="Give your campaign a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Description (optional)
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="Brief description for your team..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Audience</div>
          <div className="text-lg font-bold text-white">{formatNumber(audiencePreview?.count || 0)}</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>customers</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Channel</div>
          <div className="text-lg font-bold" style={{ color: CHANNEL_COLORS[channel] }}>{channel}</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>delivery method</div>
        </div>
      </div>

      <div
        className="p-4 rounded-xl text-sm"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Message Preview</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {messageTemplate.replace('{{name}}', 'Priya')}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#FB7185' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(4)} className="btn-secondary flex-1 justify-center">
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={handleLaunch}
          disabled={isLaunching}
          className="btn-primary flex-1 justify-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #059669)' }}
        >
          {isLaunching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Rocket size={15} />
          )}
          {isLaunching ? 'Launching...' : 'Launch Campaign'}
        </button>
      </div>
    </div>
  );
}

import { BarChart2 } from 'lucide-react';
import { useEffect } from 'react';
import { LaunchSuccessModal } from '@/components/modals/LaunchSuccessModal';

export default function NewCampaignPage() {
  const { step, reset } = useCampaignBuilder();
  const state = useCampaignBuilder();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [launched, setLaunched] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (state.step === 1 && !state.goal) return;
    setSaveState('saving');
    const timeout = setTimeout(() => setSaveState('saved'), 800);
    return () => clearTimeout(timeout);
  }, [state.goal, state.step, state.messageTemplate, state.channel, state.name, state.description]);

  if (launched) {
    return (
      <LaunchSuccessModal
        isOpen={true}
        campaignId={campaignId}
        campaignName={state.name}
        audienceSize={state.audiencePreview?.count || 0}
        channel={state.channel}
        estimatedReach={state.estimatedImpact || 'High Engagement'}
        onCreateAnother={() => {
          setLaunched(false);
          setCampaignId('');
          reset();
        }}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} style={{ color: '#A78BFA' }} />
            <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>AI Campaign Strategist</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Create New Campaign</h1>
        </div>

        {saveState !== 'idle' && (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {saveState === 'saving' ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                Saving draft...
              </>
            ) : (
              <>
                <CheckCircle size={12} style={{ color: '#10B981' }} />
                Draft Saved
              </>
            )}
          </div>
        )}
      </div>

      <StepIndicator currentStep={step} />

      <div className="glass-card p-6">
        {step === 1 && <Step1Goal />}
        {step === 2 && <Step2Audience />}
        {step === 3 && <Step3Message />}
        {step === 4 && <Step4Channel />}
        {step === 5 && <Step5Review onLaunchSuccess={(id) => {
          setCampaignId(id);
          setLaunched(true);
          reset();
        }} />}
      </div>
    </div>
  );
}
