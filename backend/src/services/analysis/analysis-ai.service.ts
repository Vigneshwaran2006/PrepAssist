import { generateStructuredContent, GEMINI_MODEL_NAME } from '../ai/gemini.service';
import type {
  CompanyDetails,
  DriveProcess,
  ResumeSuggestions,
  GapAnalysis,
  PreparationGuide,
  DriveType,
  ResumeAnalysis,
} from '../../types';

interface AnalysisContext {
  companyName: string;
  role: string;
  driveType: DriveType;
  jobDescription: string | null;
  webContext: string;
  resume: ResumeAnalysis;
}

function buildCompanyDrivePrompt(ctx: AnalysisContext): string {
  const driveSection =
    ctx.driveType === 'on_campus'
      ? `DRIVE TYPE: ON-CAMPUS PLACEMENT
Include "eligibility" section with CGPA cutoff, branches, batches, backlog policy.
Do NOT include "application_process".`
      : `DRIVE TYPE: OFF-CAMPUS APPLICATION
Include "application_process" section with channels, referral info, tips.
Do NOT include "eligibility".`;

  return `You are a placement expert. Based on the web research context, produce TWO sections as a JSON object for ${ctx.companyName} - ${ctx.role} role.

${driveSection}

RULES:
- Return ONLY valid JSON, no markdown fences.
- Base facts on the web context. Do not invent specific dates, names, or numbers.
- Provide 3-8 items per list section where sensible.
- All fields should be filled meaningfully.

JSON SCHEMA:
{
  "company_details": {
    "overview": "string (3-5 sentence company overview)",
    "founded_year": "string or null",
    "founder": "string or null",
    "headquarters": "string or null",
    "ceo": "string or null",
    "industry": "string",
    "size": "string or null (e.g. '10000+ employees')",
    "website": "string or null",
    "what_they_do": "string (2-3 sentences)",
    "current_focus": "string (what the company is prioritizing NOW)",
    "key_products": ["string"],
    "notable_clients": ["string"],
    "recent_news": [
      { "title": "string", "summary": "string", "date": "string or null", "url": "string or null" }
    ],
    "culture_and_values": [
      { "name": "string", "description": "string" }
    ],
    "interesting_facts": ["string"],
    "competitors": ["string"],
    "why_work_here": ["string"]
  },
  "drive_process": {
    "drive_type": "${ctx.driveType}",
    "overview": "string",
    "total_duration": "string or null",
    ${ctx.driveType === 'on_campus' ? `"eligibility": {
      "cgpa_cutoff": "string or null",
      "branches": ["string"],
      "batches": ["string"],
      "backlog_policy": "string or null"
    },` : `"application_process": {
      "channels": ["string"],
      "referral_info": "string or null",
      "tips": ["string"]
    },`}
    "rounds": [
      {
        "round_number": integer,
        "name": "string",
        "type": "string (OA | Coding | Technical | HR | Managerial | Behavioral)",
        "duration": "string or null",
        "description": "string",
        "what_to_expect": ["string"],
        "topics_covered": ["string"],
        "tips": ["string"],
        "difficulty": "Easy | Medium | Hard or null"
      }
    ],
    "package_info": "string or null",
    "bond_info": "string or null",
    "timeline": "string or null",
    "important_notes": ["string"]
  }
}

COMPANY: ${ctx.companyName}
ROLE: ${ctx.role}

WEB RESEARCH CONTEXT:
"""
${ctx.webContext.slice(0, 25000)}
"""

Return ONLY the JSON object.`;
}

function buildResumeGapPrompt(ctx: AnalysisContext): string {
  const skills = (ctx.resume.skills ?? [])
    .flatMap((c) => c.items.map((s) => `${s} (${c.category})`))
    .join(', ');
  const projects = (ctx.resume.projects ?? [])
    .map((p) => `${p.name}: ${p.description} [${p.technologies.join(', ')}]`)
    .join('\n');
  const experience = (ctx.resume.experience ?? [])
    .map((e) => `${e.role} at ${e.company} — ${e.technologies.join(', ')}`)
    .join('\n');

  const jdSection = ctx.jobDescription
    ? `\nJOB DESCRIPTION:\n"""\n${ctx.jobDescription.slice(0, 8000)}\n"""\n`
    : '';

  return `You are a resume expert and career coach. Analyze the candidate's resume against the target company/role and produce TWO sections.

CANDIDATE RESUME:
Skills: ${skills || 'N/A'}
Experience: ${experience || 'N/A'}
Projects: ${projects || 'N/A'}
ATS Score: ${ctx.resume.ats_score ?? 'N/A'} | Quality: ${ctx.resume.quality_score ?? 'N/A'}

TARGET: ${ctx.companyName} - ${ctx.role}
${jdSection}

COMPANY & ROLE CONTEXT (from web research):
"""
${ctx.webContext.slice(0, 15000)}
"""

RULES:
- Return ONLY valid JSON, no markdown fences.
- overall_ats_score and company_fit_score: 0-100 integers.
- match_percentage: 0-100 integer.
- readiness_level: one of "Not Ready", "Beginner", "Approaching Ready", "Ready", "Highly Qualified".
- Prioritize actionable, specific suggestions.
- For missing_skills, priority 1 = highest.
- 3-10 items per list section.

JSON SCHEMA:
{
  "resume_suggestions": {
    "overall_ats_score": 0-100,
    "company_fit_score": 0-100,
    "summary": "string",
    "keywords_to_add": ["string"],
    "keywords_to_remove": ["string"],
    "sections_to_add": ["string"],
    "suggestions": [{"section":"string","current_state":"string","suggested_change":"string","priority":"critical|high|medium|low","reason":"string","example":"string or null"}],
    "formatting_tips": ["string"],
    "sample_bullet_improvements": [{"original":"string","improved":"string"}]
  },
  "gap_analysis": {
    "match_percentage": 0-100,
    "readiness_level": "Not Ready | Beginner | Approaching Ready | Ready | Highly Qualified",
    "summary": "string",
    "matched_skills": [{"skill":"string","category":"string","strength":"strong|moderate|weak"}],
    "missing_skills": [{"skill":"string","category":"string","importance":"critical|high|medium|low","priority":1,"why_needed":"string","estimated_time":"string","quick_learn_tip":"string"}],
    "partial_skills": [{"skill":"string","current_level":"string","required_level":"string","how_to_upgrade":"string"}],
    "extra_advantages": [{"skill":"string","how_to_leverage":"string"}],
    "critical_gaps_summary": "string"
  }
}

Return ONLY the JSON object.`;
}

function buildPrepGuidePrompt(ctx: AnalysisContext): string {
  const skills = (ctx.resume.skills ?? [])
    .flatMap((c) => c.items)
    .slice(0, 20)
    .join(', ');

  return `Create step-by-step preparation guide for ${ctx.companyName} - ${ctx.role} (${ctx.driveType === 'on_campus' ? 'On-Campus' : 'Off-Campus'}).

CANDIDATE SKILLS: ${skills || 'N/A'}

COMPANY CONTEXT:
"""
${ctx.webContext.slice(0, 18000)}
"""

RULES:
- Return ONLY valid JSON, no markdown.
- 6-10 sequential steps.
- 2-4 REAL resources per step (leetcode.com, neetcode.io, takeuforward.org, bytebytego.com, freecodecamp.org, official docs).
- Weekly plan summary: one string per week.

JSON SCHEMA:
{
  "overall_strategy": "string",
  "estimated_total_prep_time": "string",
  "weekly_plan_summary": ["string"],
  "steps": [{"step_number":1,"title":"string","description":"string","duration":"string","priority":"high|medium|low","topics":["string"],"resources":[{"type":"documentation|video|course|practice|article|book","title":"string","url":"string or null"}],"practice_tasks":["string"],"success_metrics":["string"]}],
  "daily_practice_tips": ["string"],
  "common_mistakes_to_avoid": ["string"],
  "final_week_checklist": ["string"],
  "mindset_and_motivation": ["string"]
}

Return ONLY the JSON object.`;
}

export interface FullAIAnalysisResult {
  company_details: CompanyDetails;
  drive_process: DriveProcess;
  resume_suggestions: ResumeSuggestions;
  gap_analysis: GapAnalysis;
  preparation_guide: PreparationGuide;
  ai_model: string;
}

export async function runFullAnalysis(
  ctx: AnalysisContext
): Promise<FullAIAnalysisResult> {
  const [companyDrive, resumeGap, prepGuide] = await Promise.all([
    generateStructuredContent<{
      company_details: CompanyDetails;
      drive_process: DriveProcess;
    }>(buildCompanyDrivePrompt(ctx), { maxOutputTokens: 16384 }),

    generateStructuredContent<{
      resume_suggestions: ResumeSuggestions;
      gap_analysis: GapAnalysis;
    }>(buildResumeGapPrompt(ctx), { maxOutputTokens: 16384 }),

    generateStructuredContent<PreparationGuide>(buildPrepGuidePrompt(ctx), {
      maxOutputTokens: 16384,
    }),
  ]);

  return {
    company_details: companyDrive.company_details,
    drive_process: companyDrive.drive_process,
    resume_suggestions: resumeGap.resume_suggestions,
    gap_analysis: resumeGap.gap_analysis,
    preparation_guide: prepGuide,
    ai_model: GEMINI_MODEL_NAME,
  };
}