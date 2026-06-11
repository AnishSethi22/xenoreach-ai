'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api-client';
import { Zap, Users, BarChart3, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
  };
  isDemoMode?: boolean;
}

const features = [
  { icon: Sparkles, label: 'AI Campaign Strategist', desc: 'Natural language goals → campaigns' },
  { icon: Users, label: 'Customer 360', desc: 'Deep profiles with churn prediction' },
  { icon: MessageSquare, label: 'AI Copilot', desc: 'Chat-based marketing assistant' },
  { icon: BarChart3, label: 'Live Analytics', desc: 'Real-time delivery tracking' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  async function handleDemoLogin() {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/demo-login', {});
      setAuth(response.user, response.token, true);
      router.push('/overview');
    } catch {
      setError('Unable to connect to backend. Make sure the backend is running on port 4000.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleLogin() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'placeholder_configure_in_google_cloud') {
      setError('Google OAuth not configured. Use Demo Mode to access the application.');
      return;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070708' }}>
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #0d0d0f 0%, #0f0a1a 50%, #0d0d0f 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">XenoReach AI</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>by Xeno</div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              The AI Campaign Strategist{' '}
              <span className="gradient-text">for Modern Retail</span>
            </h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              From natural language goals to launched campaigns in minutes.
              AI-native. Omnichannel. Revenue-driven.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                >
                  <Icon size={18} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Built for the Xeno Engineering Internship 2026
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-1 lg:hidden">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
              >
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-semibold text-white">XenoReach AI</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Access your AI marketing command center
            </p>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#FB7185',
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            {demoMode ? (
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="btn-primary w-full justify-center"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {isLoading ? 'Signing in...' : 'Continue with Demo Mode'}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="btn-secondary w-full justify-center"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            )}
          </div>

          {demoMode && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <span style={{ color: '#A78BFA', fontWeight: 500 }}>Reviewer Mode Active</span> — Full access with pre-seeded data.
              No credentials required. All AI features are live.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
