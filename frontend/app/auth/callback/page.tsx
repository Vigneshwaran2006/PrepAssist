'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';

function CallbackHandler(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, clearAuth } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      clearAuth();
      router.replace('/auth/error?message=Authentication failed');
      return;
    }

    localStorage.setItem('access_token', token);

    authApi
      .getMe()
      .then((response) => {
        const user = response.data.data;
        if (user) {
          setAuth(
            { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
            token
          );
          router.replace('/dashboard');
        } else {
          clearAuth();
          router.replace('/auth/error?message=Failed to fetch user');
        }
      })
      .catch(() => {
        clearAuth();
        router.replace('/auth/error?message=Authentication failed');
      });
  }, [searchParams, setAuth, clearAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-900 text-lg font-medium">Signing you in...</p>
        <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
      </div>
    </div>
  );
}

function LoadingFallback(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackHandler />
    </Suspense>
  );
}