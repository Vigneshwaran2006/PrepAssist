import { generateStructuredContent, GEMINI_MODEL_NAME } from '../ai/gemini.service';
import type {
  PersonalInfo,
  SkillCategory,
  Project,
  Education,
  Experience,
  Certification,
} from '../../types';

interface WeakSection {
  section: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

interface ImprovementSuggestion {
  section: string;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIAnalysisResult {
  personal_info: PersonalInfo;
  skills: SkillCategory[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  ats_score: number;
  quality_score: number;
  missing_keywords: string[];
  weak_sections: WeakSection[];
  improvement_suggestions: ImprovementSuggestion[];
  strengths: string[];
  ai_model: string;
}

function buildResumeAnalysisPrompt(resumeText: string): string {
  return `You are an expert resume analyzer and ATS specialist for tech job applications.

Return ONLY valid JSON matching this schema. Use null for missing single values, [] for missing lists.

SCHEMA:
{
  "personal_info": {"name":"string|null","email":"string|null","phone":"string|null","location":"string|null","linkedin":"string|null","github":"string|null","portfolio":"string|null"},
  "skills": [{"category":"string","items":["string"]}],
  "projects": [{"name":"string","description":"string","technologies":["string"],"link":"string|null","duration":"string|null","highlights":["string"]}],
  "education": [{"institution":"string","degree":"string","field":"string|null","start_date":"string|null","end_date":"string|null","gpa":"string|null","achievements":["string"]}],
  "experience": [{"company":"string","role":"string","location":"string|null","start_date":"string|null","end_date":"string|null","duration":"string|null","responsibilities":["string"],"technologies":["string"]}],
  "certifications": [{"name":"string","issuer":"string","date":"string|null","credential_id":"string|null","link":"string|null"}],
  "ats_score": 0-100,
  "quality_score": 0-100,
  "missing_keywords": ["string"],
  "weak_sections": [{"section":"string","reason":"string","impact":"high|medium|low"}],
  "improvement_suggestions": [{"section":"string","issue":"string","suggestion":"string","priority":"high|medium|low"}],
  "strengths": ["string"]
}

Provide 5-10 improvement_suggestions and 3-6 strengths.

RESUME:
"""
${resumeText}
"""

Return ONLY the JSON object.`;
}

export async function analyzeResumeWithAI(
  resumeText: string
): Promise<AIAnalysisResult> {
  const prompt = buildResumeAnalysisPrompt(resumeText);

  const result = await generateStructuredContent<Omit<AIAnalysisResult, 'ai_model'>>(
    prompt,
    { maxOutputTokens: 8192 }
  );

  const ats_score = Math.max(0, Math.min(100, Math.round(result.ats_score ?? 0)));
  const quality_score = Math.max(
    0,
    Math.min(100, Math.round(result.quality_score ?? 0))
  );

  return {
    ...result,
    ats_score,
    quality_score,
    ai_model: GEMINI_MODEL_NAME,
  };
}