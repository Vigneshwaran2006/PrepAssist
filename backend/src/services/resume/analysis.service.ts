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
  // Trim resume to reasonable length
  const trimmed = resumeText.slice(0, 8000);

  return `Analyze this resume. Return ONLY valid JSON matching the schema. Use null for missing single values, [] for missing lists.

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

Provide 5-8 improvement_suggestions and 3-5 strengths.

RESUME:
"""
${trimmed}
"""

Return ONLY the JSON.`;
}

export async function analyzeResumeWithAI(
  resumeText: string
): Promise<AIAnalysisResult> {
  const prompt = buildResumeAnalysisPrompt(resumeText);

  // Gemini has much higher token limits, use as primary
  // Groq only as fallback with smaller output budget
  const result = await generateWithRouter<Omit<AIAnalysisResult, 'ai_model'>>(
    prompt,
    {
      primary: 'gemini',
      fallbacks: ['groq-fast', 'groq-medium'],
      maxOutputTokens: 4000,
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