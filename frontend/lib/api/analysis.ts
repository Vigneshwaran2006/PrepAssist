import { api } from './axios';
import type { ApiResponse, Analysis, AnalysisSummary, DriveType } from '@/types';

export interface CreateAnalysisInput {
  resume_id: string;
  company_name: string;
  role?: string;
  job_description?: string;
  drive_type: DriveType;
}

export const analysisApi = {
  create: (input: CreateAnalysisInput) =>
    api.post<ApiResponse<{ analysis: Analysis }>>('/api/analyses', input),

  list: () =>
    api.get<ApiResponse<{ analyses: AnalysisSummary[] }>>('/api/analyses'),

  getById: (id: string) =>
    api.get<ApiResponse<{ analysis: Analysis }>>(`/api/analyses/${id}`),

  retry: (id: string) =>
    api.post<ApiResponse<{ analysis: Analysis }>>(`/api/analyses/${id}/retry`),

  delete: (id: string) => api.delete<ApiResponse>(`/api/analyses/${id}`),
};