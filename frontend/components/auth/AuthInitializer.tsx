'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';

export default function AuthInitializer(): null {
  const { setAuth, clearAuth, setLoading, isAuthenticated } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = localStorage.getItem('access_token');

    if (!token && !isAuthenticated) {
      setLoading(false);
      return;
    }

    // Verify token is still valid
    authApi
      .getMe()
      .then((response) => {
        const user = response.data.data;
        const currentToken = localStorage.getItem('access_token');
        if (user && currentToken) {
          setAuth(
            {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar_url: user.avatar_url,
            },
            currentToken
          );
        } else {
          clearAuth();
        }
      })
      .catch(() => {
        // Try to refresh
        authApi
          .refresh()
          .then((res) => {
            const data = res.data.data;
            if (data) {
              setAuth(data.user, data.accessToken);
            } else {
              clearAuth();
            }
          })
          .catch(() => {
            clearAuth();
          });
      });
  }, [setAuth, clearAuth, setLoading, isAuthenticated]);

  return null;
}