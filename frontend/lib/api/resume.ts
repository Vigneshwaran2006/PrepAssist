import { api } from './axios';
import type { ApiResponse, Resume, ResumeWithAnalysis } from '@/types';

export const resumeApi = {
  upload: (file: File, title?: string) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (title) formData.append('title', title);

    return api.post<ApiResponse<{ resume: Resume }>>('/api/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: () => api.get<ApiResponse<{ resumes: Resume[] }>>('/api/resumes'),

  getById: (id: string) =>
    api.get<ApiResponse<{ resume: ResumeWithAnalysis }>>(`/api/resumes/${id}`),

  getDownloadUrl: (id: string) =>
    api.get<ApiResponse<{ url: string }>>(`/api/resumes/${id}/download-url`),

  setPrimary: (id: string) =>
    api.patch<ApiResponse>(`/api/resumes/${id}/primary`),

  delete: (id: string) => api.delete<ApiResponse>(`/api/resumes/${id}`),
};