import { create } from 'zustand';
import { CampaignBuilderState, CampaignChannel, SegmentRule, AudiencePreview } from '@/types/campaign.types';

interface CampaignBuilderStore extends CampaignBuilderState {
  step: number;
  isGeneratingAudience: boolean;
  isGeneratingMessage: boolean;
  setStep: (step: number) => void;
  setGoal: (goal: string) => void;
  setSegmentRules: (rules: SegmentRule) => void;
  setAiReasoning: (reasoning: string) => void;
  setEstimatedImpact: (impact: string) => void;
  setAudiencePreview: (preview: AudiencePreview) => void;
  setMessageTemplate: (template: string) => void;
  setSubjectLine: (subject: string) => void;
  setChannel: (channel: CampaignChannel) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setIsGeneratingAudience: (val: boolean) => void;
  setIsGeneratingMessage: (val: boolean) => void;
  reset: () => void;
  clearDraft: () => void;
}

const initialState: CampaignBuilderState & { step: number; isGeneratingAudience: boolean; isGeneratingMessage: boolean } = {
  step: 1,
  goal: '',
  segmentRules: null,
  aiReasoning: null,
  estimatedImpact: null,
  audiencePreview: null,
  messageTemplate: '',
  subjectLine: '',
  channel: 'WHATSAPP',
  name: '',
  description: '',
  isGeneratingAudience: false,
  isGeneratingMessage: false,
};

import { persist, createJSONStorage } from 'zustand/middleware';

export const useCampaignBuilder = create<CampaignBuilderStore>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setGoal: (goal) => set({ goal }),
      setSegmentRules: (segmentRules) => set({ segmentRules }),
      setAiReasoning: (aiReasoning) => set({ aiReasoning }),
      setEstimatedImpact: (estimatedImpact) => set({ estimatedImpact }),
      setAudiencePreview: (audiencePreview) => set({ audiencePreview }),
      setMessageTemplate: (messageTemplate) => set({ messageTemplate }),
      setSubjectLine: (subjectLine) => set({ subjectLine }),
      setChannel: (channel) => set({ channel }),
      setName: (name) => set({ name }),
      setDescription: (description) => set({ description }),
      setIsGeneratingAudience: (isGeneratingAudience) => set({ isGeneratingAudience }),
      setIsGeneratingMessage: (isGeneratingMessage) => set({ isGeneratingMessage }),
      reset: () => set(initialState),
      clearDraft: () => set({ ...initialState, step: 5 }),
    }),
    {
      name: 'campaign-builder-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
