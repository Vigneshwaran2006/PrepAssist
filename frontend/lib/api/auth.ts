import { api } from './axios';
import type { ApiResponse, User } from '@/types';

interface MeResponse {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

interface RefreshResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  getMe: () => api.get<ApiResponse<MeResponse>>('/api/auth/me'),

  refresh: () => api.post<ApiResponse<RefreshResponse>>('/api/auth/refresh'),

  logout: () => api.post<ApiResponse>('/api/auth/logout'),

  logoutAll: () => api.post<ApiResponse>('/api/auth/logout-all'),

  getSessions: () => api.get<ApiResponse<{ sessions: unknown[] }>>('/api/auth/sessions'),

  loginWithGoogle: () => {
    window.location.href = `${process.env['NEXT_PUBLIC_API_URL']}/api/auth/google`;
  },
};