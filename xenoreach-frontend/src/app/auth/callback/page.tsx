'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api-client';
import { Zap } from 'lucide-react';

interface AuthCallbackResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
  };
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    api
      .post<AuthCallbackResponse>('/auth/google/callback', { code })
      .then((data) => {
        setAuth(data.user, data.token, false);
        router.replace('/overview');
      })
      .catch(() => {
        router.replace('/login?error=oauth_failed');
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070708' }}>
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}
        >
          <Zap size={22} className="text-white" />
        </div>
        <div className="text-center">
          <div className="text-white font-medium">Signing you in...</div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Completing Google authentication
          </div>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#8B5CF6', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#070708' }} />}>
      <CallbackContent />
    </Suspense>
  );
}
