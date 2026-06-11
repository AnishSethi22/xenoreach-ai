import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CopilotStore {
  isOpen: boolean;
  messages: Message[];
  isThinking: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setThinking: (thinking: boolean) => void;
  clearMessages: () => void;
}

export const useCopilotStore = create<CopilotStore>((set) => ({
  isOpen: false,
  messages: [],
  isThinking: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random()}`,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),
  setThinking: (isThinking) => set({ isThinking }),
  clearMessages: () => set({ messages: [] }),
}));
