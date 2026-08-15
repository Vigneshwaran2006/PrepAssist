import { supabaseAdmin } from '../../config/supabase';
import type {
  Resume,
  ResumeAnalysis,
  ResumeStatus,
  ResumeWithAnalysis,
} from '../../types';
import type { AIAnalysisResult } from './analysis.service';

interface CreateResumeInput {
  user_id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  is_primary: boolean;
}

export async function createResumeRecord(
  input: CreateResumeInput
): Promise<Resume> {
  const { data, error } = await supabaseAdmin
    .from('resumes')
    .insert({ ...input, status: 'pending' })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create resume: ${error.message}`);
  return data as Resume;
}

export async function updateResumeStatus(
  resumeId: string,
  status: ResumeStatus,
  errorMessage: string | null = null,
  rawText: string | null = null
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (errorMessage !== null) update['error_message'] = errorMessage;
  if (rawText !== null) update['raw_text'] = rawText;

  const { error } = await supabaseAdmin
    .from('resumes')
    .update(update)
    .eq('id', resumeId);

  if (error) throw new Error(`Failed to update resume status: ${error.message}`);
}

export async function saveResumeAnalysis(
  resumeId: string,
  userId: string,
  analysis: AIAnalysisResult
): Promise<ResumeAnalysis> {
  // Delete any existing analysis first
  await supabaseAdmin
    .from('resume_analyses')
    .delete()
    .eq('resume_id', resumeId);

  const { data, error } = await supabaseAdmin
    .from('resume_analyses')
    .insert({
      resume_id: resumeId,
      user_id: userId,
      personal_info: analysis.personal_info,
      skills: analysis.skills,
      projects: analysis.projects,
      education: analysis.education,
      experience: analysis.experience,
      certifications: analysis.certifications,
      ats_score: analysis.ats_score,
      quality_score: analysis.quality_score,
      missing_keywords: analysis.missing_keywords,
      weak_sections: analysis.weak_sections,
      improvement_suggestions: analysis.improvement_suggestions,
      strengths: analysis.strengths,
      ai_model: analysis.ai_model,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to save analysis: ${error.message}`);
  return data as ResumeAnalysis;
}

export async function getUserResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch resumes: ${error.message}`);
  return (data as Resume[]) ?? [];
}

export async function getResumeById(
  resumeId: string,
  userId: string
): Promise<Resume | null> {
  const { data, error } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as Resume;
}

export async function getResumeWithAnalysis(
  resumeId: string,
  userId: string
): Promise<ResumeWithAnalysis | null> {
  const resume = await getResumeById(resumeId, userId);
  if (!resume) return null;

  const { data: analysis } = await supabaseAdmin
    .from('resume_analyses')
    .select('*')
    .eq('resume_id', resumeId)
    .maybeSingle();

  return { ...resume, analysis: (analysis as ResumeAnalysis) ?? null };
}

export async function deleteResume(
  resumeId: string,
  userId: string
): Promise<Resume | null> {
  const resume = await getResumeById(resumeId, userId);
  if (!resume) return null;

  const { error } = await supabaseAdmin
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete resume: ${error.message}`);
  return resume;
}

export async function setPrimaryResume(
  resumeId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('resumes')
    .update({ is_primary: true })
    .eq('id', resumeId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to set primary: ${error.message}`);
}

export async function userHasPrimaryResume(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('resumes')
    .select('id')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}