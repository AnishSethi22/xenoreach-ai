'use client';

import { useState, useRef, useEffect } from 'react';
import { useCopilotStore } from '@/store/copilot.store';
import { api } from '@/lib/api-client';
import { X, MessageSquare, Send, Sparkles, Bot } from 'lucide-react';

const STARTER_PROMPTS = [
  'Which customers are at highest churn risk?',
  'What campaign should I run this week?',
  'Show me my best performing channel',
  'How are my VIP customers doing?',
];

export function CopilotPanel() {
  const { isOpen, messages, isThinking, toggle, addMessage, setThinking, clearMessages } = useCopilotStore();
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('Gemini');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage(
        'assistant',
        "Hi! I'm your XenoReach AI Copilot 👋 I have access to your full customer database and campaign analytics. Ask me anything about your marketing strategy, customer segments, or campaign performance.",
      );
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setInput('');
    addMessage('user', trimmed);
    setThinking(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.content }));
      const result = await api.post<{ answer: string; provider?: string }>('/ai/copilot', {
        question: trimmed,
        history,
      });
      addMessage('assistant', result.answer);
      if (result.provider) {
        setProvider(result.provider);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Copilot Error]', errorMsg);
      addMessage('assistant', 'I ran into an issue fetching a response. Please try again in a moment.');
    } finally {
      setThinking(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        className="copilot-fab"
        aria-label="Open AI Copilot"
        title="AI Copilot"
      >
        <Sparkles size={22} className="text-white" />
      </button>
    );
  }

  return (
    <div className="copilot-panel animate-scale-in">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          background: 'rgba(139, 92, 246, 0.08)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Copilot</div>
            <div className="text-xs transition-colors" style={{ color: provider === 'Gemini' ? '#A78BFA' : '#10B981' }}>Powered by {provider}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearMessages}
            className="text-xs px-2 py-1 rounded"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
          >
            Clear
          </button>
          <button onClick={toggle} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
              >
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div
              className="max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? {
                      background: 'rgba(139, 92, 246, 0.25)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'rgba(255,255,255,0.9)',
                      borderBottomRightRadius: 4,
                    }
                  : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.85)',
                      borderBottomLeftRadius: 4,
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
            >
              <Bot size={12} className="text-white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottomLeftRadius: 4,
              }}
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#A78BFA', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && !isThinking && (
          <div className="space-y-2 mt-2">
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Try asking:</div>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: 'rgba(139, 92, 246, 0.06)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none"
            placeholder="Ask anything about your customers..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ lineHeight: 1.5, maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
