export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_info: string | null;
  ip_address: string | null;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface JwtAccessPayload {
  userId: string;
  email: string;
  sessionId: string;
}

export interface JwtRefreshPayload {
  userId: string;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===== Resume Types (kept) =====
export type ResumeStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  is_primary: boolean;
  raw_text: string | null;
  status: ResumeStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string | null;
  duration: string | null;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  achievements: string[];
}

export interface Experience {
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  duration: string | null;
  responsibilities: string[];
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string | null;
  credential_id: string | null;
  link: string | null;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  user_id: string;
  personal_info: PersonalInfo | null;
  skills: SkillCategory[] | null;
  projects: Project[] | null;
  education: Education[] | null;
  experience: Experience[] | null;
  certifications: Certification[] | null;
  ats_score: number | null;
  quality_score: number | null;
  missing_keywords: string[] | null;
  weak_sections: unknown[] | null;
  improvement_suggestions: unknown[] | null;
  strengths: string[] | null;
  ai_model: string | null;
  analysis_version: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeWithAnalysis extends Resume {
  analysis: ResumeAnalysis | null;
}

// ===== Analysis (Unified) Types =====
export type DriveType = 'on_campus' | 'off_campus';
export type AnalysisStatus =
  | 'pending'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed';

// Tab 1 — Company Details
export interface CompanyDetails {
  overview: string;
  founded_year: string | null;
  founder: string | null;
  headquarters: string | null;
  ceo: string | null;
  industry: string;
  size: string | null;
  website: string | null;
  what_they_do: string;
  current_focus: string;
  key_products: string[];
  notable_clients: string[];
  recent_news: {
    title: string;
    summary: string;
    date: string | null;
    url: string | null;
  }[];
  culture_and_values: {
    name: string;
    description: string;
  }[];
  interesting_facts: string[];
  competitors: string[];
  why_work_here: string[];
}

// Tab 2 — Drive Process
export interface DriveProcessRound {
  round_number: number;
  name: string;
  type: string;
  duration: string | null;
  description: string;
  what_to_expect: string[];
  topics_covered: string[];
  tips: string[];
  difficulty: string | null;
}

export interface DriveProcess {
  drive_type: DriveType;
  overview: string;
  total_duration: string | null;
  eligibility?: {
    cgpa_cutoff: string | null;
    branches: string[];
    batches: string[];
    backlog_policy: string | null;
  };
  application_process?: {
    channels: string[];
    referral_info: string | null;
    tips: string[];
  };
  rounds: DriveProcessRound[];
  package_info: string | null;
  bond_info: string | null;
  timeline: string | null;
  important_notes: string[];
}

// Tab 3 — Resume Suggestions
export interface ResumeSuggestionItem {
  section: string;
  current_state: string;
  suggested_change: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  example: string | null;
}

export interface ResumeSuggestions {
  overall_ats_score: number;
  company_fit_score: number;
  summary: string;
  keywords_to_add: string[];
  keywords_to_remove: string[];
  sections_to_add: string[];
  suggestions: ResumeSuggestionItem[];
  formatting_tips: string[];
  sample_bullet_improvements: {
    original: string;
    improved: string;
  }[];
}

// Tab 4 — Gap Analysis
export interface MatchedItem {
  skill: string;
  category: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface MissingItem {
  skill: string;
  category: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  priority: number;
  why_needed: string;
  estimated_time: string;
  quick_learn_tip: string;
}

export interface PartialItem {
  skill: string;
  current_level: string;
  required_level: string;
  how_to_upgrade: string;
}

export interface GapAnalysis {
  match_percentage: number;
  readiness_level: string;
  summary: string;
  matched_skills: MatchedItem[];
  missing_skills: MissingItem[];
  partial_skills: PartialItem[];
  extra_advantages: {
    skill: string;
    how_to_leverage: string;
  }[];
  critical_gaps_summary: string;
}

// Tab 5 — Preparation Guide
export interface PrepStep {
  step_number: number;
  title: string;
  description: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  topics: string[];
  resources: {
    type: string;
    title: string;
    url: string | null;
  }[];
  practice_tasks: string[];
  success_metrics: string[];
}

export interface PreparationGuide {
  overall_strategy: string;
  estimated_total_prep_time: string;
  weekly_plan_summary: string[];
  steps: PrepStep[];
  daily_practice_tips: string[];
  common_mistakes_to_avoid: string[];
  final_week_checklist: string[];
  mindset_and_motivation: string[];
}

export interface AnalysisSource {
  title: string;
  url: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  resume_id: string;
  company_name: string;
  role: string | null;
  job_description: string | null;
  drive_type: DriveType;
  dedup_key: string;

  status: AnalysisStatus;
  error_message: string | null;
  resolved_role: string | null;

  company_details: CompanyDetails | null;
  drive_process: DriveProcess | null;
  resume_suggestions: ResumeSuggestions | null;
  gap_analysis: GapAnalysis | null;
  preparation_guide: PreparationGuide | null;
  sources: AnalysisSource[] | null;

  ai_model: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisSummary {
  id: string;
  user_id: string;
  resume_id: string;
  company_name: string;
  role: string | null;
  drive_type: DriveType;
  status: AnalysisStatus;
  error_message: string | null;
  resolved_role: string | null;
  created_at: string;
  updated_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}