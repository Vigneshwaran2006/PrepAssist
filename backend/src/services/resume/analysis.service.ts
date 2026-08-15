import { generateWithRouter } from '../ai/ai-router.service';
import { GEMINI_MODEL_NAME } from '../ai/gemini.service';
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
  return `You are an expert resume analyzer and ATS (Applicant Tracking System) specialist for tech job applications.

Analyze the following resume and return a JSON object with the exact schema below.

RULES:
- Return ONLY valid JSON, no explanations or markdown.
- Do not invent information. If a field is missing, use null (for single values) or [] (for lists).
- All dates must be strings in "Month YYYY" format if possible, else the original string, else null.
- ats_score: 0-100 integer indicating ATS compatibility (formatting, keywords, structure, quantifiable metrics).
- quality_score: 0-100 integer indicating overall content quality (impact, clarity, relevance, achievements).
- missing_keywords: important technical/industry keywords likely missing for a tech role.
- weak_sections: sections that are missing, incomplete, or weak. Include impact level.
- improvement_suggestions: 5-10 specific, actionable suggestions. Include priority level.
- strengths: 3-6 strong points of this resume.

JSON SCHEMA:
{
  "personal_info": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "portfolio": "string or null"
  },
  "skills": [
    {
      "category": "string (e.g. Programming Languages, Frameworks, Databases, Tools, Cloud, Soft Skills)",
      "items": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string or null",
      "duration": "string or null",
      "highlights": ["string (achievements, metrics)"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "start_date": "string or null",
      "end_date": "string or null",
      "gpa": "string or null",
      "achievements": ["string"]
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string or null",
      "start_date": "string or null",
      "end_date": "string or null (use 'Present' if current)",
      "duration": "string or null",
      "responsibilities": ["string"],
      "technologies": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string or null",
      "credential_id": "string or null",
      "link": "string or null"
    }
  ],
  "ats_score": 0-100,
  "quality_score": 0-100,
  "missing_keywords": ["string"],
  "weak_sections": [
    {
      "section": "string",
      "reason": "string",
      "impact": "high | medium | low"
    }
  ],
  "improvement_suggestions": [
    {
      "section": "string",
      "issue": "string",
      "suggestion": "string",
      "priority": "high | medium | low"
    }
  ],
  "strengths": ["string"]
}

RESUME TEXT:
"""
${resumeText}
"""

Return ONLY the JSON object.`;
}

export async function analyzeResumeWithAI(
  resumeText: string
): Promise<AIAnalysisResult> {
  const prompt = buildResumeAnalysisPrompt(resumeText);

  // Primary: Gemini (great for structured resume extraction)
  // Fallback: Groq medium (openai/gpt-oss-20b)
  const result = await generateWithRouter<Omit<AIAnalysisResult, 'ai_model'>>(
    prompt,
    {
      primary: 'gemini',
      fallbacks: ['groq-medium', 'groq-large'],
      maxOutputTokens: 8192,
    }
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