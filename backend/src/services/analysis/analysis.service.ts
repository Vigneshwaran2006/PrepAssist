import crypto from 'crypto';
import { supabaseAdmin } from '../../config/supabase';
import type {
  Analysis,
  AnalysisSummary,
  AnalysisStatus,
  DriveType,
  ResumeAnalysis,
  AnalysisSource,
} from '../../types';
import type { FullAIAnalysisResult } from './analysis-ai.service';

export function buildDedupKey(input: {
  companyName: string;
  role: string;
  driveType: DriveType;
  resumeId: string;
  jobDescription: string | null;
}): string {
  const jdHash = input.jobDescription
    ? crypto.createHash('md5').update(input.jobDescription.trim()).digest('hex').slice(0, 12)
    : 'no_jd';

  return `${input.companyName.toLowerCase().trim()}|${input.role.toLowerCase().trim()}|${input.driveType}|${input.resumeId}|${jdHash}`;
}

interface CreateInput {
  user_id: string;
  resume_id: string;
  company_name: string;
  role: string | null;
  job_description: string | null;
  drive_type: DriveType;
}

/**
 * Creates a new analysis or returns existing (deduplication).
 */
export async function createOrGetAnalysis(
  input: CreateInput,
  resolvedRole: string
): Promise<{ analysis: Analysis; isNew: boolean }> {
  const dedup_key = buildDedupKey({
    companyName: input.company_name,
    role: resolvedRole,
    driveType: input.drive_type,
    resumeId: input.resume_id,
    jobDescription: input.job_description,
  });

  const { data: existing } = await supabaseAdmin
    .from('analyses')
    .select('*')
    .eq('user_id', input.user_id)
    .eq('dedup_key', dedup_key)
    .maybeSingle();

  if (existing) {
    return { analysis: existing as Analysis, isNew: false };
  }

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert({
      user_id: input.user_id,
      resume_id: input.resume_id,
      company_name: input.company_name.trim(),
      role: input.role,
      job_description: input.job_description,
      drive_type: input.drive_type,
      dedup_key,
      resolved_role: resolvedRole,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create analysis: ${error.message}`);
  return { analysis: data as Analysis, isNew: true };
}

export async function updateAnalysisStatus(
  id: string,
  status: AnalysisStatus,
  errorMessage: string | null = null
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (errorMessage !== null) update['error_message'] = errorMessage;
  const { error } = await supabaseAdmin.from('analyses').update(update).eq('id', id);
  if (error) throw new Error(`Failed to update status: ${error.message}`);
}

export async function saveFullAnalysis(
  id: string,
  result: FullAIAnalysisResult,
  sources: AnalysisSource[]
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('analyses')
    .update({
      company_details: result.company_details,
      drive_process: result.drive_process,
      resume_suggestions: result.resume_suggestions,
      gap_analysis: result.gap_analysis,
      preparation_guide: result.preparation_guide,
      sources,
      ai_model: result.ai_model,
      status: 'completed',
      error_message: null,
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to save analysis: ${error.message}`);
}

export async function retryAnalysis(id: string, userId: string): Promise<Analysis | null> {
  const analysis = await getAnalysisById(id, userId);
  if (!analysis) return null;

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .update({ status: 'pending', error_message: null })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to retry: ${error.message}`);
  return data as Analysis;
}

export async function getUserAnalyses(userId: string): Promise<AnalysisSummary[]> {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(
      'id, user_id, resume_id, company_name, role, drive_type, status, error_message, resolved_role, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch: ${error.message}`);
  return (data as AnalysisSummary[]) ?? [];
}

export async function getAnalysisById(
  id: string,
  userId: string
): Promise<Analysis | null> {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as Analysis;
}

export async function deleteAnalysis(id: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  return true;
}

export async function fetchResumeAnalysisFor(
  resumeId: string,
  userId: string
): Promise<ResumeAnalysis | null> {
  const { data, error } = await supabaseAdmin
    .from('resume_analyses')
    .select('*')
    .eq('resume_id', resumeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as ResumeAnalysis) ?? null;
}